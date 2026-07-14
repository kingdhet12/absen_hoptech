// ==============================
// State Aplikasi
// ==============================
const state = {
  client: null,
  employees: [],
  reportRows: [],
  employeePage: 1,
  employeePageSize: 8,
  employeeTotal: 0,
  employeeSortColumn: "created_at",
  employeeSortDirection: "desc",
  selectedAttendanceEmployee: null,
  todayAttendance: null,
  deleteEmployeeId: null,
  charts: {},
};

// ==============================
// Elemen DOM
// ==============================
const dom = {
  loadingOverlay: document.getElementById("loadingOverlay"),
  toastContainer: document.getElementById("toastContainer"),
  loginScreen: document.getElementById("loginScreen"),
  appShell: document.getElementById("appShell"),
  configWarning: document.getElementById("configWarning"),
  loginForm: document.getElementById("loginForm"),
  loginEmail: document.getElementById("loginEmail"),
  loginPassword: document.getElementById("loginPassword"),
  sidebar: document.getElementById("sidebar"),
  sidebarToggle: document.getElementById("sidebarToggle"),
  sidebarLinks: document.querySelectorAll(".sidebar__link[data-view]"),
  logoutButton: document.getElementById("logoutButton"),
  pageTitle: document.getElementById("pageTitle"),
  todayText: document.getElementById("todayText"),
  realtimeClock: document.getElementById("realtimeClock"),
  darkModeToggle: document.getElementById("darkModeToggle"),
  themeStatusText: document.getElementById("themeStatusText"),
  supabaseStatusText: document.getElementById("supabaseStatusText"),
  statTotalEmployees: document.getElementById("statTotalEmployees"),
  statPresentToday: document.getElementById("statPresentToday"),
  statAbsentToday: document.getElementById("statAbsentToday"),
  statLateToday: document.getElementById("statLateToday"),
  statMonthlyAttendance: document.getElementById("statMonthlyAttendance"),
  monthlyAttendanceBar: document.getElementById("monthlyAttendanceBar"),
  addEmployeeButton: document.getElementById("addEmployeeButton"),
  employeeSearch: document.getElementById("employeeSearch"),
  employeeTableBody: document.getElementById("employeeTableBody"),
  employeePagination: document.getElementById("employeePagination"),
  employeeModal: document.getElementById("employeeModal"),
  employeeModalTitle: document.getElementById("employeeModalTitle"),
  employeeForm: document.getElementById("employeeForm"),
  employeeRecordId: document.getElementById("employeeRecordId"),
  employeeIdInput: document.getElementById("employeeIdInput"),
  employeeNameInput: document.getElementById("employeeNameInput"),
  employeeDivisionInput: document.getElementById("employeeDivisionInput"),
  employeePositionInput: document.getElementById("employeePositionInput"),
  employeePhotoInput: document.getElementById("employeePhotoInput"),
  employeeJoinDateInput: document.getElementById("employeeJoinDateInput"),
  employeeStatusInput: document.getElementById("employeeStatusInput"),
  confirmModal: document.getElementById("confirmModal"),
  confirmDeleteButton: document.getElementById("confirmDeleteButton"),
  confirmMessage: document.getElementById("confirmMessage"),
  attendanceForm: document.getElementById("attendanceForm"),
  attendanceEmployeeId: document.getElementById("attendanceEmployeeId"),
  attendanceStatus: document.getElementById("attendanceStatus"),
  attendanceDateText: document.getElementById("attendanceDateText"),
  attendanceTimeText: document.getElementById("attendanceTimeText"),
  saveAttendanceButton: document.getElementById("saveAttendanceButton"),
  checkoutButton: document.getElementById("checkoutButton"),
  previewPhoto: document.getElementById("previewPhoto"),
  previewName: document.getElementById("previewName"),
  previewMeta: document.getElementById("previewMeta"),
  previewCheckIn: document.getElementById("previewCheckIn"),
  previewCheckOut: document.getElementById("previewCheckOut"),
  previewStatus: document.getElementById("previewStatus"),
  reportDateFilter: document.getElementById("reportDateFilter"),
  reportMonthFilter: document.getElementById("reportMonthFilter"),
  reportYearFilter: document.getElementById("reportYearFilter"),
  reportNameFilter: document.getElementById("reportNameFilter"),
  reportDivisionFilter: document.getElementById("reportDivisionFilter"),
  reportStatusFilter: document.getElementById("reportStatusFilter"),
  applyReportFilterButton: document.getElementById("applyReportFilterButton"),
  reportTableBody: document.getElementById("reportTableBody"),
  exportCsvButton: document.getElementById("exportCsvButton"),
  exportExcelButton: document.getElementById("exportExcelButton"),
  printReportButton: document.getElementById("printReportButton"),
  backToTop: document.getElementById("backToTop"),
};

// ==============================
// Helper Format dan Validasi
// ==============================
function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentTime() {
  return new Date().toTimeString().slice(0, 8);
}

function formatDate(dateValue) {
  if (!dateValue) return "-";
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(timeValue) {
  if (!timeValue) return "-";
  return String(timeValue).slice(0, 8);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function debounce(callback, delay = 350) {
  let timeoutId;

  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
}

function showLoading(message = "Memuat data...") {
  dom.loadingOverlay.querySelector("p").textContent = message;
  dom.loadingOverlay.classList.add("show");
}

function hideLoading() {
  dom.loadingOverlay.classList.remove("show");
}

function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 4200);
}

function getStatusBadge(status) {
  const map = {
    Aktif: "success",
    Nonaktif: "danger",
    Hadir: "success",
    Terlambat: "warning",
    Izin: "primary",
    Sakit: "primary",
    Alpha: "danger",
  };

  return `<span class="badge badge--${map[status] || "primary"}">${escapeHtml(status || "-")}</span>`;
}

function requireClient() {
  if (!state.client) {
    throw new Error("Supabase belum dikonfigurasi atau belum tersambung.");
  }
}

// ==============================
// Auth Admin
// ==============================
async function initAuth() {
  if (!window.HoptechSupabase.isConfigured()) {
    dom.configWarning.classList.add("show");
    dom.supabaseStatusText.textContent = "Belum dikonfigurasi";
    return;
  }

  state.client = window.HoptechSupabase.getClient();
  dom.configWarning.classList.remove("show");
  dom.supabaseStatusText.textContent = "Tersambung";

  const { data } = await state.client.auth.getSession();
  if (data.session) {
    await showApp();
  }
}

async function handleLogin(event) {
  event.preventDefault();

  if (!window.HoptechSupabase.isConfigured()) {
    showToast("Isi URL dan anon key Supabase di config.js terlebih dahulu.", "warning");
    return;
  }

  try {
    showLoading("Login admin...");
    state.client = window.HoptechSupabase.getClient();

    const { error } = await state.client.auth.signInWithPassword({
      email: dom.loginEmail.value.trim(),
      password: dom.loginPassword.value,
    });

    if (error) throw error;

    dom.loginForm.reset();
    showToast("Login berhasil.");
    await showApp();
  } catch (error) {
    showToast(error.message || "Login gagal.", "error");
  } finally {
    hideLoading();
  }
}

async function handleLogout() {
  try {
    showLoading("Logout...");
    await state.client.auth.signOut();
    dom.appShell.classList.add("hidden");
    dom.loginScreen.classList.remove("hidden");
    showToast("Logout berhasil.");
  } catch (error) {
    showToast(error.message || "Logout gagal.", "error");
  } finally {
    hideLoading();
  }
}

async function showApp() {
  dom.loginScreen.classList.add("hidden");
  dom.appShell.classList.remove("hidden");
  await refreshAllData();
}

// ==============================
// Dashboard
// ==============================
async function refreshDashboard() {
  requireClient();

  const today = getTodayDate();
  const startOfMonth = today.slice(0, 8) + "01";
  const activeEmployeesResult = await state.client.from("employees").select("employee_id,status").eq("status", "Aktif");
  if (activeEmployeesResult.error) throw activeEmployeesResult.error;

  const totalActive = activeEmployeesResult.data.length;
  const todayResult = await state.client.from("attendance").select("*").eq("attendance_date", today);
  if (todayResult.error) throw todayResult.error;

  const todayRows = todayResult.data || [];
  const presentToday = todayRows.filter((row) => row.attendance_status === "Hadir").length;
  const lateToday = todayRows.filter((row) => row.attendance_status === "Terlambat").length;
  const attendedToday = todayRows.filter((row) => ["Hadir", "Terlambat"].includes(row.attendance_status)).length;
  const absentToday = Math.max(totalActive - attendedToday, 0);

  const monthResult = await state.client
    .from("attendance")
    .select("attendance_status,attendance_date")
    .gte("attendance_date", startOfMonth)
    .lte("attendance_date", today);
  if (monthResult.error) throw monthResult.error;

  const dayOfMonth = new Date().getDate();
  const denominator = Math.max(totalActive * dayOfMonth, 1);
  const monthlyPresent = monthResult.data.filter((row) => ["Hadir", "Terlambat"].includes(row.attendance_status)).length;
  const monthlyPercent = Math.min(Math.round((monthlyPresent / denominator) * 100), 100);

  dom.statTotalEmployees.textContent = totalActive;
  dom.statPresentToday.textContent = presentToday;
  dom.statLateToday.textContent = lateToday;
  dom.statAbsentToday.textContent = absentToday;
  dom.statMonthlyAttendance.textContent = `${monthlyPercent}%`;
  dom.monthlyAttendanceBar.style.width = `${monthlyPercent}%`;
}

// ==============================
// CRUD Karyawan
// ==============================
async function loadEmployees() {
  requireClient();

  const search = dom.employeeSearch.value.trim().replace(/[%,]/g, "");
  const from = (state.employeePage - 1) * state.employeePageSize;
  const to = from + state.employeePageSize - 1;
  const ascending = state.employeeSortDirection === "asc";

  let query = state.client
    .from("employees")
    .select("*", { count: "exact" })
    .order(state.employeeSortColumn, { ascending })
    .range(from, to);

  if (search) {
    query = query.or(`name.ilike.%${search}%,employee_id.ilike.%${search}%,division.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;

  state.employees = data || [];
  state.employeeTotal = count || 0;
  renderEmployeeTable();
  renderEmployeePagination();
}

function renderEmployeeTable() {
  if (state.employees.length === 0) {
    dom.employeeTableBody.innerHTML = `
      <tr>
        <td colspan="7">Data karyawan tidak ditemukan.</td>
      </tr>
    `;
    return;
  }

  dom.employeeTableBody.innerHTML = state.employees
    .map((employee) => `
      <tr>
        <td>${escapeHtml(employee.employee_id)}</td>
        <td>${escapeHtml(employee.name)}</td>
        <td>${escapeHtml(employee.division)}</td>
        <td>${escapeHtml(employee.position)}</td>
        <td>${formatDate(employee.join_date)}</td>
        <td>${getStatusBadge(employee.status)}</td>
        <td>
          <div class="action-buttons">
            <button class="table-button" type="button" data-edit-employee="${employee.id}" aria-label="Edit karyawan">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="table-button table-button--danger" type="button" data-delete-employee="${employee.id}" aria-label="Hapus karyawan">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderEmployeePagination() {
  const totalPages = Math.max(Math.ceil(state.employeeTotal / state.employeePageSize), 1);
  const buttons = [];

  for (let page = 1; page <= totalPages; page += 1) {
    buttons.push(`<button type="button" class="${page === state.employeePage ? "active" : ""}" data-page="${page}">${page}</button>`);
  }

  dom.employeePagination.innerHTML = buttons.join("");
}

function openEmployeeModal(employee = null) {
  dom.employeeForm.reset();
  dom.employeeRecordId.value = employee?.id || "";
  dom.employeeModalTitle.textContent = employee ? "Edit Karyawan" : "Tambah Karyawan";
  dom.employeeIdInput.value = employee?.employee_id || "";
  dom.employeeNameInput.value = employee?.name || "";
  dom.employeeDivisionInput.value = employee?.division || "";
  dom.employeePositionInput.value = employee?.position || "";
  dom.employeePhotoInput.value = employee?.photo || "";
  dom.employeeJoinDateInput.value = employee?.join_date || getTodayDate();
  dom.employeeStatusInput.value = employee?.status || "Aktif";
  dom.employeeModal.classList.add("show");
  dom.employeeModal.setAttribute("aria-hidden", "false");
}

function closeEmployeeModal() {
  dom.employeeModal.classList.remove("show");
  dom.employeeModal.setAttribute("aria-hidden", "true");
}

async function saveEmployee(event) {
  event.preventDefault();
  requireClient();

  const recordId = dom.employeeRecordId.value;
  const payload = {
    employee_id: dom.employeeIdInput.value.trim().toUpperCase(),
    name: dom.employeeNameInput.value.trim(),
    division: dom.employeeDivisionInput.value.trim(),
    position: dom.employeePositionInput.value.trim(),
    photo: dom.employeePhotoInput.value.trim() || null,
    join_date: dom.employeeJoinDateInput.value,
    status: dom.employeeStatusInput.value,
  };

  if (!payload.employee_id || !payload.name || !payload.division || !payload.position || !payload.join_date) {
    showToast("Semua field wajib diisi kecuali URL foto.", "warning");
    return;
  }

  try {
    showLoading("Menyimpan karyawan...");
    const duplicateResult = await state.client.from("employees").select("id").eq("employee_id", payload.employee_id).maybeSingle();
    if (duplicateResult.error) throw duplicateResult.error;
    if (duplicateResult.data && duplicateResult.data.id !== recordId) {
      showToast("Employee ID sudah digunakan.", "warning");
      return;
    }

    const result = recordId
      ? await state.client.from("employees").update(payload).eq("id", recordId)
      : await state.client.from("employees").insert(payload);

    if (result.error) throw result.error;

    closeEmployeeModal();
    showToast(recordId ? "Data karyawan diperbarui." : "Karyawan baru ditambahkan.");
    await refreshAllData();
  } catch (error) {
    showToast(error.message || "Gagal menyimpan karyawan.", "error");
  } finally {
    hideLoading();
  }
}

function requestDeleteEmployee(employeeId) {
  const employee = state.employees.find((item) => item.id === employeeId);
  state.deleteEmployeeId = employeeId;
  dom.confirmMessage.textContent = `Hapus data ${employee?.name || "karyawan ini"}? Data absensi terkait akan ikut terhapus.`;
  dom.confirmModal.classList.add("show");
}

function closeConfirmModal() {
  dom.confirmModal.classList.remove("show");
  state.deleteEmployeeId = null;
}

async function deleteEmployee() {
  if (!state.deleteEmployeeId) return;

  try {
    showLoading("Menghapus data...");
    const { error } = await state.client.from("employees").delete().eq("id", state.deleteEmployeeId);
    if (error) throw error;

    closeConfirmModal();
    showToast("Data karyawan dihapus.");
    await refreshAllData();
  } catch (error) {
    showToast(error.message || "Gagal menghapus data.", "error");
  } finally {
    hideLoading();
  }
}

// ==============================
// Absensi
// ==============================
async function loadAttendanceEmployee() {
  const employeeId = dom.attendanceEmployeeId.value.trim().toUpperCase();
  resetAttendancePreview();

  if (!employeeId) return;

  try {
    const employeeResult = await state.client.from("employees").select("*").eq("employee_id", employeeId).maybeSingle();
    if (employeeResult.error) throw employeeResult.error;

    if (!employeeResult.data) {
      showToast("ID karyawan tidak ditemukan.", "warning");
      return;
    }

    state.selectedAttendanceEmployee = employeeResult.data;
    const attendanceResult = await state.client
      .from("attendance")
      .select("*")
      .eq("employee_id", employeeId)
      .eq("attendance_date", getTodayDate())
      .maybeSingle();
    if (attendanceResult.error) throw attendanceResult.error;

    state.todayAttendance = attendanceResult.data || null;
    renderAttendancePreview();
  } catch (error) {
    showToast(error.message || "Gagal memuat data karyawan.", "error");
  }
}

function resetAttendancePreview() {
  state.selectedAttendanceEmployee = null;
  state.todayAttendance = null;
  dom.previewPhoto.src = "assets/avatar/default-avatar.svg";
  dom.previewName.textContent = "Masukkan ID Karyawan";
  dom.previewMeta.textContent = "Nama, divisi, dan jabatan akan tampil otomatis.";
  dom.previewCheckIn.textContent = "-";
  dom.previewCheckOut.textContent = "-";
  dom.previewStatus.textContent = "-";
  dom.saveAttendanceButton.disabled = false;
  dom.checkoutButton.disabled = true;
}

function renderAttendancePreview() {
  const employee = state.selectedAttendanceEmployee;
  const attendance = state.todayAttendance;

  dom.previewPhoto.src = employee.photo || "assets/avatar/default-avatar.svg";
  dom.previewName.textContent = employee.name;
  dom.previewMeta.textContent = `${employee.division} • ${employee.position}`;
  dom.previewCheckIn.textContent = formatTime(attendance?.check_in);
  dom.previewCheckOut.textContent = formatTime(attendance?.check_out);
  dom.previewStatus.textContent = attendance?.attendance_status || "Belum absen";
  dom.saveAttendanceButton.disabled = Boolean(attendance);
  dom.checkoutButton.disabled = !attendance || Boolean(attendance.check_out);

  if (attendance) {
    showToast("Karyawan ini sudah memiliki data absensi hari ini.", "warning");
  }
}

async function saveAttendance(event) {
  event.preventDefault();

  if (!state.selectedAttendanceEmployee) {
    showToast("Masukkan ID karyawan yang valid terlebih dahulu.", "warning");
    return;
  }

  try {
    showLoading("Menyimpan absensi...");
    const employeeId = state.selectedAttendanceEmployee.employee_id;
    const duplicateResult = await state.client
      .from("attendance")
      .select("id")
      .eq("employee_id", employeeId)
      .eq("attendance_date", getTodayDate())
      .maybeSingle();
    if (duplicateResult.error) throw duplicateResult.error;

    if (duplicateResult.data) {
      showToast("Absensi ganda ditolak. Karyawan sudah absen hari ini.", "warning");
      return;
    }

    const status = dom.attendanceStatus.value;
    const payload = {
      employee_id: employeeId,
      attendance_date: getTodayDate(),
      check_in: ["Hadir", "Terlambat"].includes(status) ? getCurrentTime() : null,
      check_out: null,
      attendance_status: status,
    };

    const { error } = await state.client.from("attendance").insert(payload);
    if (error) throw error;

    showToast("Absensi berhasil disimpan.");
    await loadAttendanceEmployee();
    await refreshDashboard();
  } catch (error) {
    showToast(error.message || "Gagal menyimpan absensi.", "error");
  } finally {
    hideLoading();
  }
}

async function setCheckoutTime() {
  if (!state.todayAttendance) return;

  try {
    showLoading("Memperbarui jam keluar...");
    const { error } = await state.client
      .from("attendance")
      .update({ check_out: getCurrentTime() })
      .eq("id", state.todayAttendance.id);
    if (error) throw error;

    showToast("Jam keluar berhasil diperbarui.");
    await loadAttendanceEmployee();
  } catch (error) {
    showToast(error.message || "Gagal memperbarui jam keluar.", "error");
  } finally {
    hideLoading();
  }
}

// ==============================
// Laporan
// ==============================
function setupReportFilters() {
  const monthNames = ["Semua Bulan", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  dom.reportMonthFilter.innerHTML = monthNames.map((name, index) => `<option value="${index}">${name}</option>`).join("");

  const currentYear = new Date().getFullYear();
  const years = ["", currentYear - 2, currentYear - 1, currentYear, currentYear + 1];
  dom.reportYearFilter.innerHTML = years
    .map((year) => `<option value="${year}">${year || "Semua Tahun"}</option>`)
    .join("");
  dom.reportMonthFilter.value = new Date().getMonth() + 1;
  dom.reportYearFilter.value = currentYear;
}

async function loadReports() {
  requireClient();

  const employeeResult = await state.client.from("employees").select("*");
  if (employeeResult.error) throw employeeResult.error;
  const employeeMap = new Map(employeeResult.data.map((employee) => [employee.employee_id, employee]));

  let query = state.client.from("attendance").select("*").order("attendance_date", { ascending: false });
  const exactDate = dom.reportDateFilter.value;
  const month = Number(dom.reportMonthFilter.value);
  const year = Number(dom.reportYearFilter.value);

  if (exactDate) {
    query = query.eq("attendance_date", exactDate);
  } else {
    if (year) {
      const fromDate = `${year}-${String(month || 1).padStart(2, "0")}-01`;
      const toDate = month ? new Date(year, month, 0).toISOString().slice(0, 10) : `${year}-12-31`;
      query = query.gte("attendance_date", fromDate).lte("attendance_date", toDate);
    }
  }

  if (dom.reportStatusFilter.value) {
    query = query.eq("attendance_status", dom.reportStatusFilter.value);
  }

  const { data, error } = await query.limit(1000);
  if (error) throw error;

  const keyword = dom.reportNameFilter.value.trim().toLowerCase();
  const division = dom.reportDivisionFilter.value.trim().toLowerCase();

  state.reportRows = (data || [])
    .map((attendance) => {
      const employee = employeeMap.get(attendance.employee_id) || {};
      return {
        ...attendance,
        name: employee.name || "-",
        division: employee.division || "-",
        position: employee.position || "-",
      };
    })
    .filter((row) => {
      const matchesKeyword = !keyword || row.name.toLowerCase().includes(keyword) || row.employee_id.toLowerCase().includes(keyword);
      const matchesDivision = !division || row.division.toLowerCase().includes(division);
      return matchesKeyword && matchesDivision;
    });

  renderReportTable();
}

function renderReportTable() {
  if (state.reportRows.length === 0) {
    dom.reportTableBody.innerHTML = `<tr><td colspan="8">Data laporan tidak ditemukan.</td></tr>`;
    return;
  }

  dom.reportTableBody.innerHTML = state.reportRows
    .map((row) => `
      <tr>
        <td>${formatDate(row.attendance_date)}</td>
        <td>${escapeHtml(row.employee_id)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.division)}</td>
        <td>${escapeHtml(row.position)}</td>
        <td>${formatTime(row.check_in)}</td>
        <td>${formatTime(row.check_out)}</td>
        <td>${getStatusBadge(row.attendance_status)}</td>
      </tr>
    `)
    .join("");
}

function exportCsv() {
  const headers = ["Tanggal", "ID", "Nama", "Divisi", "Jabatan", "Jam Masuk", "Jam Keluar", "Status"];
  const rows = state.reportRows.map((row) => [
    row.attendance_date,
    row.employee_id,
    row.name,
    row.division,
    row.position,
    formatTime(row.check_in),
    formatTime(row.check_out),
    row.attendance_status,
  ]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
  downloadFile(`laporan-absensi-${getTodayDate()}.csv`, `\ufeff${csv}`, "text/csv;charset=utf-8;");
}

function exportExcel() {
  const table = document.getElementById("reportPrintArea").innerHTML;
  const html = `<html><head><meta charset="UTF-8"></head><body>${table}</body></html>`;
  downloadFile(`laporan-absensi-${getTodayDate()}.xls`, html, "application/vnd.ms-excel");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// ==============================
// Grafik
// ==============================
async function loadCharts() {
  if (!window.Chart) return;

  const employeeResult = await state.client.from("employees").select("employee_id,name");
  if (employeeResult.error) throw employeeResult.error;
  const employeeMap = new Map(employeeResult.data.map((employee) => [employee.employee_id, employee.name]));

  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const monthEnd = new Date(year, month, 0).toISOString().slice(0, 10);

  const yearResult = await state.client.from("attendance").select("*").gte("attendance_date", `${year}-01-01`).lte("attendance_date", `${year}-12-31`);
  if (yearResult.error) throw yearResult.error;

  const monthResult = await state.client.from("attendance").select("*").gte("attendance_date", monthStart).lte("attendance_date", monthEnd);
  if (monthResult.error) throw monthResult.error;

  const weeklyStart = new Date();
  weeklyStart.setDate(weeklyStart.getDate() - 6);
  const weekResult = await state.client.from("attendance").select("*").gte("attendance_date", weeklyStart.toISOString().slice(0, 10)).lte("attendance_date", getTodayDate());
  if (weekResult.error) throw weekResult.error;

  const previous = new Date();
  previous.setMonth(previous.getMonth() - 1);
  const prevYear = previous.getFullYear();
  const prevMonth = previous.getMonth() + 1;
  const prevStart = `${prevYear}-${String(prevMonth).padStart(2, "0")}-01`;
  const prevEnd = new Date(prevYear, prevMonth, 0).toISOString().slice(0, 10);
  const topResult = await state.client.from("attendance").select("*").gte("attendance_date", prevStart).lte("attendance_date", prevEnd);
  if (topResult.error) throw topResult.error;

  renderMonthlyChart(yearResult.data || []);
  renderWeeklyChart(weekResult.data || []);
  renderStatusPieChart(monthResult.data || []);
  renderTopEmployeeChart(topResult.data || [], employeeMap);
}

function createChart(id, config) {
  if (state.charts[id]) {
    state.charts[id].destroy();
  }
  const context = document.getElementById(id);
  state.charts[id] = new Chart(context, config);
}

function renderMonthlyChart(rows) {
  const labels = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const data = Array(12).fill(0);
  rows.forEach((row) => {
    if (["Hadir", "Terlambat"].includes(row.attendance_status)) {
      data[new Date(`${row.attendance_date}T00:00:00`).getMonth()] += 1;
    }
  });

  createChart("monthlyChart", {
    type: "bar",
    data: { labels, datasets: [{ label: "Kehadiran", data, backgroundColor: "#2563EB" }] },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

function renderWeeklyChart(rows) {
  const labels = [];
  const data = [];

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    labels.push(date.toLocaleDateString("id-ID", { weekday: "short" }));
    data.push(rows.filter((row) => row.attendance_date === key && ["Hadir", "Terlambat"].includes(row.attendance_status)).length);
  }

  createChart("weeklyChart", {
    type: "line",
    data: { labels, datasets: [{ label: "Hadir", data, borderColor: "#22C55E", backgroundColor: "rgba(34,197,94,0.14)", fill: true, tension: 0.35 }] },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

function renderStatusPieChart(rows) {
  const statuses = ["Hadir", "Izin", "Sakit", "Alpha", "Terlambat"];
  const data = statuses.map((status) => rows.filter((row) => row.attendance_status === status).length);

  createChart("statusPieChart", {
    type: "doughnut",
    data: { labels: statuses, datasets: [{ data, backgroundColor: ["#22C55E", "#2563EB", "#38BDF8", "#EF4444", "#F59E0B"] }] },
    options: { responsive: true, maintainAspectRatio: false },
  });
}

function renderTopEmployeeChart(rows, employeeMap) {
  const counts = new Map();
  rows.forEach((row) => {
    if (["Hadir", "Terlambat"].includes(row.attendance_status)) {
      counts.set(row.employee_id, (counts.get(row.employee_id) || 0) + 1);
    }
  });

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  createChart("topEmployeeChart", {
    type: "bar",
    data: {
      labels: top.map(([employeeId]) => employeeMap.get(employeeId) || employeeId),
      datasets: [{ label: "Jumlah Hadir", data: top.map(([, count]) => count), backgroundColor: "#22C55E" }],
    },
    options: { indexAxis: "y", responsive: true, maintainAspectRatio: false },
  });
}

// ==============================
// Navigasi dan UI
// ==============================
async function refreshAllData() {
  try {
    showLoading("Memuat data aplikasi...");
    await Promise.all([refreshDashboard(), loadEmployees(), loadReports()]);
    await loadCharts();
  } catch (error) {
    showToast(error.message || "Gagal memuat data.", "error");
  } finally {
    hideLoading();
  }
}

function showView(viewId) {
  document.querySelectorAll(".view-section").forEach((section) => section.classList.remove("active"));
  document.getElementById(viewId).classList.add("active");
  dom.sidebarLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === viewId));
  dom.pageTitle.textContent = document.querySelector(`[data-view="${viewId}"]`).textContent.trim();
  dom.sidebar.classList.remove("show");

  if (viewId === "chartsView") {
    loadCharts().catch((error) => showToast(error.message, "error"));
  }
}

function updateClock() {
  const now = new Date();
  dom.realtimeClock.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
  dom.todayText.textContent = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  dom.attendanceDateText.textContent = formatDate(getTodayDate());
  dom.attendanceTimeText.textContent = now.toLocaleTimeString("id-ID", { hour12: false });
}

function applyTheme() {
  const savedTheme = localStorage.getItem("hoptech-theme");
  document.body.classList.toggle("dark-mode", savedTheme === "dark");
  updateThemeStatus();
}

function updateThemeStatus() {
  const dark = document.body.classList.contains("dark-mode");
  dom.darkModeToggle.querySelector("i").className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  dom.themeStatusText.textContent = dark ? "Dark Mode" : "Light Mode";
}

function setupRipple() {
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".ripple-button");
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.className = "ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });
}

// ==============================
// Event Listener
// ==============================
function bindEvents() {
  dom.loginForm.addEventListener("submit", handleLogin);
  dom.logoutButton.addEventListener("click", handleLogout);
  dom.sidebarToggle.addEventListener("click", () => dom.sidebar.classList.toggle("show"));
  dom.sidebarLinks.forEach((link) => link.addEventListener("click", () => showView(link.dataset.view)));
  dom.darkModeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("hoptech-theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    updateThemeStatus();
  });

  dom.addEmployeeButton.addEventListener("click", () => openEmployeeModal());
  dom.employeeForm.addEventListener("submit", saveEmployee);
  document.querySelectorAll("[data-close-modal]").forEach((element) => element.addEventListener("click", closeEmployeeModal));
  document.querySelectorAll("[data-close-confirm]").forEach((element) => element.addEventListener("click", closeConfirmModal));
  dom.confirmDeleteButton.addEventListener("click", deleteEmployee);

  dom.employeeSearch.addEventListener("input", debounce(async () => {
    state.employeePage = 1;
    await loadEmployees();
  }));

  dom.employeeTableBody.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-edit-employee]");
    const deleteButton = event.target.closest("[data-delete-employee]");

    if (editButton) {
      const employee = state.employees.find((item) => item.id === editButton.dataset.editEmployee);
      openEmployeeModal(employee);
    }

    if (deleteButton) {
      requestDeleteEmployee(deleteButton.dataset.deleteEmployee);
    }
  });

  document.querySelectorAll("[data-employee-sort]").forEach((header) => {
    header.addEventListener("click", async () => {
      const column = header.dataset.employeeSort;
      if (state.employeeSortColumn === column) {
        state.employeeSortDirection = state.employeeSortDirection === "asc" ? "desc" : "asc";
      } else {
        state.employeeSortColumn = column;
        state.employeeSortDirection = "asc";
      }
      await loadEmployees();
    });
  });

  dom.employeePagination.addEventListener("click", async (event) => {
    const pageButton = event.target.closest("[data-page]");
    if (!pageButton) return;
    state.employeePage = Number(pageButton.dataset.page);
    await loadEmployees();
  });

  dom.attendanceEmployeeId.addEventListener("input", debounce(loadAttendanceEmployee, 450));
  dom.attendanceForm.addEventListener("submit", saveAttendance);
  dom.checkoutButton.addEventListener("click", setCheckoutTime);

  dom.applyReportFilterButton.addEventListener("click", () => loadReports().catch((error) => showToast(error.message, "error")));
  dom.exportCsvButton.addEventListener("click", exportCsv);
  dom.exportExcelButton.addEventListener("click", exportExcel);
  dom.printReportButton.addEventListener("click", () => window.print());

  window.addEventListener("scroll", () => {
    dom.backToTop.classList.toggle("show", window.scrollY > 480);
  });
  dom.backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ==============================
// Inisialisasi
// ==============================
document.addEventListener("DOMContentLoaded", async () => {
  applyTheme();
  setupRipple();
  setupReportFilters();
  bindEvents();
  updateClock();
  setInterval(updateClock, 1000);
  await initAuth();
});
