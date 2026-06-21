import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BriefcaseBusiness,
  CalendarClock,
  Download,
  FileInput,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import "./styles.css";

const STORAGE_KEY = "job-dashboard-companies";

const STATUSES = [
  "気になる",
  "応募済み",
  "書類選考中",
  "面接予定",
  "結果待ち",
  "内定",
  "辞退",
  "不採用",
  "保留"
];

const PRIORITIES = ["S", "A", "B", "C"];
const ACTIVE_STATUSES = ["応募済み", "書類選考中", "面接予定", "結果待ち", "保留"];

const emptyForm = {
  companyName: "",
  positionName: "",
  applicationSource: "",
  jobUrl: "",
  companyUrl: "",
  location: "",
  appliedDate: "",
  status: "気になる",
  priority: "B",
  nextScheduleDate: "",
  memo: "",
  concernMemo: ""
};

function loadCompanies() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCompanies(companies) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies));
}

function formatDate(value) {
  if (!value) return "未設定";
  return value.replaceAll("-", "/");
}

function isDue(value) {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) <= today;
}

function sortByDateDesc(a, b, key) {
  const av = a[key] ? new Date(a[key]).getTime() : 0;
  const bv = b[key] ? new Date(b[key]).getTime() : 0;
  return bv - av;
}

function sortByDateAscEmptyLast(a, b, key) {
  if (!a[key] && !b[key]) return 0;
  if (!a[key]) return 1;
  if (!b[key]) return -1;
  return new Date(a[key]).getTime() - new Date(b[key]).getTime();
}

function App() {
  const [companies, setCompanies] = useState(loadCompanies);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortType, setSortType] = useState("updatedDesc");
  const [editingCompany, setEditingCompany] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const importRef = useRef(null);

  useEffect(() => {
    saveCompanies(companies);
  }, [companies]);

  const summary = useMemo(
    () => ({
      total: companies.length,
      active: companies.filter((company) => ACTIVE_STATUSES.includes(company.status)).length,
      interviews: companies.filter((company) => company.status === "面接予定").length,
      offers: companies.filter((company) => company.status === "内定").length,
      rejected: companies.filter((company) => ["辞退", "不採用"].includes(company.status)).length
    }),
    [companies]
  );

  const filteredCompanies = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    return companies
      .filter((company) => {
        const matchesKeyword =
          !keyword ||
          [
            company.companyName,
            company.positionName,
            company.applicationSource,
            company.location,
            company.memo,
            company.concernMemo
          ]
            .join(" ")
            .toLowerCase()
            .includes(keyword);
        const matchesStatus = statusFilter === "all" || company.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || company.priority === priorityFilter;
        return matchesKeyword && matchesStatus && matchesPriority;
      })
      .sort((a, b) => {
        if (sortType === "appliedDesc") return sortByDateDesc(a, b, "appliedDate");
        if (sortType === "nextScheduleAsc") return sortByDateAscEmptyLast(a, b, "nextScheduleDate");
        return sortByDateDesc(a, b, "updatedAt");
      });
  }, [companies, priorityFilter, searchKeyword, sortType, statusFilter]);

  function openCreateModal() {
    setEditingCompany(null);
    setIsModalOpen(true);
  }

  function openEditModal(company) {
    setEditingCompany(company);
    setIsModalOpen(true);
  }

  function handleSave(form) {
    const now = new Date().toISOString();
    if (editingCompany) {
      setCompanies((current) =>
        current.map((company) =>
          company.id === editingCompany.id ? { ...editingCompany, ...form, updatedAt: now } : company
        )
      );
    } else {
      setCompanies((current) => [
        {
          id: `company_${Date.now()}`,
          ...form,
          createdAt: now,
          updatedAt: now
        },
        ...current
      ]);
    }
    setIsModalOpen(false);
  }

  function handleDelete(id) {
    if (!confirm("この企業データを削除しますか？")) return;
    setCompanies((current) => current.filter((company) => company.id !== id));
    setIsModalOpen(false);
  }

  function exportJson() {
    const today = new Date().toISOString().slice(0, 10);
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      companies
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `job-dashboard-backup-${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!confirm("現在のデータを上書きします。よろしいですか？")) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!Array.isArray(parsed.companies)) throw new Error("Invalid file");
        setCompanies(parsed.companies);
      } catch {
        alert("インポートできないファイル形式です。");
      }
    };
    reader.readAsText(file);
  }

  return (
    <>
      <div className="app-shell">
        <Header
          onCreate={openCreateModal}
          onExport={exportJson}
          onImport={() => importRef.current?.click()}
        />
        <input ref={importRef} className="hidden-input" type="file" accept="application/json" onChange={importJson} />
        <main>
          <SummaryCards summary={summary} />
          <Filters
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            sortType={sortType}
            setSortType={setSortType}
          />
          <CompanyList
            companies={filteredCompanies}
            totalCount={companies.length}
            onEdit={openEditModal}
          />
        </main>
      </div>
      {isModalOpen && (
        <CompanyModal
          company={editingCompany}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}

function Header({ onCreate, onExport, onImport }) {
  return (
    <header className="app-header">
      <div className="brand">
        <BriefcaseBusiness size={22} aria-hidden="true" />
        <h1>転職ダッシュボード</h1>
      </div>
      <div className="header-actions">
        <button className="button secondary" type="button" onClick={onImport}>
          <FileInput size={16} aria-hidden="true" />
          インポート
        </button>
        <button className="button secondary" type="button" onClick={onExport}>
          <Download size={16} aria-hidden="true" />
          エクスポート
        </button>
        <button className="button primary" type="button" onClick={onCreate}>
          <Plus size={16} aria-hidden="true" />
          企業追加
        </button>
      </div>
    </header>
  );
}

function SummaryCards({ summary }) {
  const cards = [
    ["全企業数", summary.total],
    ["進行中", summary.active],
    ["面接予定", summary.interviews],
    ["内定", summary.offers],
    ["落選", summary.rejected]
  ];

  return (
    <section className="summary-grid" aria-label="サマリー">
      {cards.map(([label, value]) => (
        <div className="summary-card" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function Filters(props) {
  return (
    <section className="filters" aria-label="検索と絞り込み">
      <label className="search-field">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          value={props.searchKeyword}
          onChange={(event) => props.setSearchKeyword(event.target.value)}
          placeholder="企業名、職種、メモで検索"
        />
      </label>
      <select value={props.statusFilter} onChange={(event) => props.setStatusFilter(event.target.value)}>
        <option value="all">ステータス：すべて</option>
        {STATUSES.map((status) => (
          <option value={status} key={status}>
            {status}
          </option>
        ))}
      </select>
      <select value={props.priorityFilter} onChange={(event) => props.setPriorityFilter(event.target.value)}>
        <option value="all">志望度：すべて</option>
        {PRIORITIES.map((priority) => (
          <option value={priority} key={priority}>
            {priority}
          </option>
        ))}
      </select>
      <select value={props.sortType} onChange={(event) => props.setSortType(event.target.value)}>
        <option value="updatedDesc">更新日が新しい順</option>
        <option value="appliedDesc">応募日が新しい順</option>
        <option value="nextScheduleAsc">次回予定日が近い順</option>
      </select>
    </section>
  );
}

function CompanyList({ companies, totalCount, onEdit }) {
  if (totalCount === 0) {
    return (
      <div className="empty-state">
        <strong>まだ企業が登録されていません。</strong>
        <span>「企業追加」から転職活動中の企業を登録しましょう。</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="empty-state">
        <strong>条件に一致する企業がありません。</strong>
      </div>
    );
  }

  return (
    <section className="company-grid" aria-label="企業一覧">
      {companies.map((company) => (
        <CompanyCard company={company} key={company.id} onEdit={() => onEdit(company)} />
      ))}
    </section>
  );
}

function CompanyCard({ company, onEdit }) {
  const due = isDue(company.nextScheduleDate);

  return (
    <article className="company-card" onClick={onEdit}>
      <div className="card-title-row">
        <div>
          <h2>{company.companyName}</h2>
          <p>{company.positionName || "職種名 未設定"}</p>
        </div>
        <span className={`priority priority-${company.priority}`}>志望度 {company.priority}</span>
      </div>
      <div className="status-row">
        <span className={`status status-${company.status}`}>{company.status}</span>
        {due && <span className="due-label">要確認</span>}
      </div>
      <dl className="card-details">
        <div>
          <dt>応募媒体</dt>
          <dd>{company.applicationSource || "未設定"}</dd>
        </div>
        <div>
          <dt>勤務地</dt>
          <dd>{company.location || "未設定"}</dd>
        </div>
        <div>
          <dt>応募日</dt>
          <dd>{formatDate(company.appliedDate)}</dd>
        </div>
        <div>
          <dt>次回予定日</dt>
          <dd>{formatDate(company.nextScheduleDate)}</dd>
        </div>
      </dl>
      <button className="card-edit" type="button" onClick={onEdit}>
        <Pencil size={15} aria-hidden="true" />
        編集
      </button>
    </article>
  );
}

function CompanyModal({ company, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(() => (company ? { ...emptyForm, ...company } : emptyForm));
  const isEdit = Boolean(company);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.companyName.trim()) {
      alert("企業名を入力してください。");
      return;
    }
    onSave({ ...form, companyName: form.companyName.trim() });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form className="modal" onSubmit={handleSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{isEdit ? "企業編集" : "企業追加"}</h2>
            <p>{isEdit ? "応募情報と選考メモを更新します。" : "転職活動中の企業を登録します。"}</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="閉じる">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="form-grid">
          <TextField label="企業名" value={form.companyName} onChange={(value) => updateField("companyName", value)} required />
          <TextField label="職種名" value={form.positionName} onChange={(value) => updateField("positionName", value)} />
          <TextField label="応募媒体" value={form.applicationSource} onChange={(value) => updateField("applicationSource", value)} />
          <TextField label="勤務地" value={form.location} onChange={(value) => updateField("location", value)} />
          <TextField label="求人URL" value={form.jobUrl} onChange={(value) => updateField("jobUrl", value)} type="url" />
          <TextField label="企業サイトURL" value={form.companyUrl} onChange={(value) => updateField("companyUrl", value)} type="url" />
          <TextField label="応募日" value={form.appliedDate} onChange={(value) => updateField("appliedDate", value)} type="date" />
          <TextField label="次回予定日" value={form.nextScheduleDate} onChange={(value) => updateField("nextScheduleDate", value)} type="date" />
          <label>
            選考ステータス
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label>
            志望度
            <select value={form.priority} onChange={(event) => updateField("priority", event.target.value)}>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="link-row">
          {form.jobUrl && (
            <a href={form.jobUrl} target="_blank" rel="noreferrer">
              求人URLを開く
            </a>
          )}
          {form.companyUrl && (
            <a href={form.companyUrl} target="_blank" rel="noreferrer">
              企業サイトを開く
            </a>
          )}
        </div>
        <label>
          メモ
          <textarea value={form.memo} onChange={(event) => updateField("memo", event.target.value)} rows={4} />
        </label>
        <label>
          懸念点メモ
          <textarea value={form.concernMemo} onChange={(event) => updateField("concernMemo", event.target.value)} rows={4} />
        </label>
        <div className="modal-actions">
          <div className="modal-action-left">
            {isEdit && (
              <button className="button danger" type="button" onClick={() => onDelete(company.id)}>
                <Trash2 size={16} aria-hidden="true" />
                削除
              </button>
            )}
          </div>
          <div className="modal-action-right">
            <button className="button secondary" type="button" onClick={onClose}>
              キャンセル
            </button>
            <button className="button primary" type="submit">
              保存
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, value, onChange, type = "text", required = false }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} required={required} />
    </label>
  );
}

createRoot(document.getElementById("root")).render(<App />);
