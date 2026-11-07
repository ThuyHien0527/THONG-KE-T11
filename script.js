let currentNavTab = "sai-line";
let currentNoteType = "all";

window.onload = function () {
  switchNavTab("sai-line");
};

function switchNavTab(tab, event) {
  currentNavTab = tab;

  document.querySelectorAll(".nav-menu .nav-item").forEach((btn) => btn.classList.remove("active"));
  if (event) {
    event.target.classList.add("active");
  } else {
    const firstTab = document.querySelector(".nav-menu .nav-item");
    if (firstTab) firstTab.classList.add("active");
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  const dataContainer = document.getElementById("tab-data-container");
  const thongKeContainer = document.getElementById("tab-thong-ke");
  const subFilter = document.getElementById("sai-line-subfilter");
  const saiLineVendor = document.getElementById("sai-line-vendor-group");
  const thieuKienVendor = document.getElementById("thieu-kien-vendor-group");
  const pageTitle = document.getElementById("page-main-title");

  document.getElementById("main-table-container").style.display = "block";
  document.getElementById("ranking-section").style.display = "none";

  if (tab === "sai-line") {
    pageTitle.innerText = "⚡ Danh Sách Lỗi Để Sai Line Tháng 11";
    dataContainer.style.display = "block";
    thongKeContainer.style.display = "none";
    subFilter.style.display = "flex";
    saiLineVendor.style.display = "flex";
    thieuKienVendor.style.display = "none";

    currentNoteType = "all";
    document
      .querySelectorAll("#sai-line-subfilter .btn")
      .forEach((btn) => btn.classList.remove("active"));
    const firstSubBtn = document.querySelector("#sai-line-subfilter .btn");
    if (firstSubBtn) firstSubBtn.classList.add("active");

    renderTable(dataSaiLine, "all");
  } else if (tab === "thieu-kien") {
    pageTitle.innerText = "📦 Danh Sách Thiếu Kiện Tháng 11";
    dataContainer.style.display = "block";
    thongKeContainer.style.display = "none";
    subFilter.style.display = "none";
    saiLineVendor.style.display = "none";
    thieuKienVendor.style.display = "flex";

    currentNoteType = "Thiếu kiện";
    renderTable(dataThieuKien, "Thiếu kiện");
  } else if (tab === "thong-ke") {
    pageTitle.innerText = "📊 Báo Cáo Thống Kê Tổng Hợp Lỗi & Tiền Đền";
    dataContainer.style.display = "none";
    thongKeContainer.style.display = "block";

    renderReportTable();
    renderGroupReportTable();
  }
}

function renderTable(data, type) {
  const tbody = document.getElementById("table-body");
  const theadTr = document.querySelector("#data-table thead tr");
  tbody.innerHTML = "";
  document.getElementById("main-table-container").style.display = "block";
  document.getElementById("ranking-section").style.display = "none";

  theadTr.innerHTML = `
    <th>STT</th>
    <th>Ngày</th>
    <th>Mã Phiếu Chuyển</th>
    <th>Số Lượng</th>
    <th>Line Đúng</th>
    <th>Line Sai / Wave</th>
    <th>Phân Loại (Note)</th>
    <th>Nhân Viên Vi Phạm (User)</th>
    <th>Vendor</th>
    <th>Nhóm Hàng</th>
    <th>Tổng Tiền</th>
  `;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 25px; color: #777;">Không tìm thấy nhân viên hoặc phiếu chuyển phù hợp</td></tr>`;
    return;
  }

  data.forEach((item, index) => {
    let v = (item.vendor || "Khác").toUpperCase();
    let badgeClass = "vendor-khac";
    if (v === "PST") badgeClass = "vendor-pst";
    else if (v === "VCO") badgeClass = "vendor-vco";
    else if (v === "NVCT") badgeClass = "vendor-nvct";
    else if (v === "GHM") badgeClass = "vendor-ghm";

    let noteColor = item.note === "Thiếu kiện" ? "#9c27b0" : "#d93025";
    let formattedPrice = Number(item.tongTien || 0).toLocaleString("vi-VN") + " đ";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.ngay}</td>
      <td><strong>${item.phieuChuyen}</strong></td>
      <td>${item.soLuongSai}</td>
      <td>${item.lineDung}</td>
      <td>${item.lineSai}</td>
      <td><span style="color: ${noteColor}; font-weight: 600;">${item.note}</span></td>
      <td><strong>${item.user}</strong></td>
      <td><span class="vendor-badge ${badgeClass}">${item.vendor}</span></td>
      <td><span>${item.nhom}</span></td>
      <td><strong>${formattedPrice}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

function searchTable() {
  let input = document.getElementById("searchInput");
  let filter = input.value.toLowerCase().trim();

  document.getElementById("main-table-container").style.display = "block";
  document.getElementById("ranking-section").style.display = "none";

  let sourceData = currentNavTab === "thieu-kien" ? dataThieuKien : dataSaiLine;

  let filtered = sourceData.filter((item) => {
    let userName = (item.user || "").toLowerCase();
    let ptCode = (item.phieuChuyen || "").toLowerCase();
    let vendorName = (item.vendor || "").toLowerCase();
    let groupName = (item.nhom || "").toLowerCase();

    let matchSearch =
      userName.includes(filter) ||
      ptCode.includes(filter) ||
      vendorName.includes(filter) ||
      groupName.includes(filter);

    let matchType = currentNoteType === "all" ? true : item.note === currentNoteType;
    return matchSearch && matchType;
  });

  renderTable(filtered, currentNoteType);
}

function showVendorRanking(category, vendorName, event) {
  const parentGroup = event.target.closest(".vendor-button-group");
  parentGroup.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
  event.target.classList.add("active");

  document.getElementById("main-table-container").style.display = "none";
  document.getElementById("ranking-section").style.display = "block";

  const rankingBody = document.getElementById("ranking-body");
  rankingBody.innerHTML = "";

  let sourceData = category === "Thiếu kiện" ? dataThieuKien : dataSaiLine;

  let filtered = sourceData.filter((item) => {
    return vendorName === "ALL"
      ? true
      : (item.vendor || "").toUpperCase() === vendorName.toUpperCase();
  });

  let titlePrefix =
    category === "Thiếu kiện"
      ? "📦 Thống Kê Nhân Viên THIẾU KIỆN"
      : "⚠️ Thống Kê Nhân Viên ĐỂ SAI LINE";
  document.getElementById("ranking-title").innerText =
    vendorName !== "ALL"
      ? `${titlePrefix} - Vendor: ${vendorName}`
      : `${titlePrefix} - Tất Cả Vendor`;

  let totalErrors = 0;
  let totalCash = 0;
  filtered.forEach((item) => {
    totalErrors += Number(item.soLuongSai);
    totalCash += Number(item.tongTien || 0);
  });

  const userMap = {};
  filtered.forEach((item) => {
    if (!userMap[item.user]) {
      userMap[item.user] = { user: item.user, vendor: item.vendor, totalQty: 0, totalAmount: 0 };
    }
    userMap[item.user].totalQty += Number(item.soLuongSai);
    userMap[item.user].totalAmount += Number(item.tongTien || 0);
  });

  let sortedUsers = Object.values(userMap).sort((a, b) => b.totalQty - a.totalQty);

  if (sortedUsers.length === 0) {
    rankingBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: #777;">Không có dữ liệu cho Vendor này</td></tr>`;
    return;
  }

  sortedUsers.forEach((item, index) => {
    let rankBadge = `<span class="badge-normal">Top ${index + 1}</span>`;
    if (index === 0) rankBadge = `<span class="badge-top1">🥇 TOP 1</span>`;
    else if (index === 1) rankBadge = `<span class="badge-top2">🥈 TOP 2</span>`;
    else if (index === 2) rankBadge = `<span class="badge-top3">🥉 TOP 3</span>`;

    let percentage = totalErrors > 0 ? ((item.totalQty / totalErrors) * 100).toFixed(2) : 0;
    let formattedUserMoney = Number(item.totalAmount).toLocaleString("vi-VN") + " đ";

    let v = (item.vendor || "Khác").toUpperCase();
    let badgeClass = "vendor-khac";
    if (v === "PST") badgeClass = "vendor-pst";
    else if (v === "VCO") badgeClass = "vendor-vco";
    else if (v === "NVCT") badgeClass = "vendor-nvct";
    else if (v === "GHM") badgeClass = "vendor-ghm";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rankBadge}</td>
      <td><strong>${item.user}</strong></td>
      <td><span class="vendor-badge ${badgeClass}">${item.vendor}</span></td>
      <td><strong style="color: #d93025; font-size: 15px;">${item.totalQty}</strong></td>
      <td><strong style="color: #b91c1c;">${formattedUserMoney}</strong></td>
      <td><strong>${percentage}%</strong></td>
    `;
    rankingBody.appendChild(tr);
  });
}

function filterTable(type, event) {
  currentNoteType = type;
  document
    .querySelectorAll("#sai-line-subfilter .btn")
    .forEach((btn) => btn.classList.remove("active"));
  if (event) event.target.classList.add("active");

  let searchInput = document.getElementById("searchInput");
  if (searchInput) searchInput.value = "";

  if (type === "all") {
    renderTable(dataSaiLine, "all");
  } else {
    const filtered = dataSaiLine.filter((item) => item.note === type);
    renderTable(filtered, type);
  }
}

function renderReportTable() {
  const reportBody = document.getElementById("report-body");
  if (!reportBody) return;
  reportBody.innerHTML = "";

  const summary = {};
  let totalErrors = 0;
  let totalAmount = 0;

  rawData.forEach((item) => {
    let note = item.note || "Khác";
    let qty = Number(item.soLuongSai) || 0;
    let money = Number(item.tongTien) || 0;

    if (!summary[note]) {
      summary[note] = { count: 0, amount: 0 };
    }
    summary[note].count += qty;
    summary[note].amount += money;
    totalErrors += qty;
    totalAmount += money;
  });

  let sortedSummary = Object.keys(summary)
    .map((note) => ({
      note: note,
      count: summary[note].count,
      amount: summary[note].amount,
      percentage: totalErrors > 0 ? ((summary[note].count / totalErrors) * 100).toFixed(2) : "0.00",
    }))
    .sort((a, b) => b.count - a.count);

  sortedSummary.forEach((item, index) => {
    let formattedMoney = Number(item.amount).toLocaleString("vi-VN") + " đ";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${item.note}</strong></td>
      <td><strong>${item.count}</strong></td>
      <td><strong>${item.percentage}%</strong></td>
      <td><strong style="color: #b91c1c;">${formattedMoney}</strong></td>
      <td>${index === 0 ? "⚠️ Cần ưu tiên khắc phục" : "Theo dõi thêm"}</td>
    `;
    reportBody.appendChild(tr);
  });

  let formattedTotalMoney = Number(totalAmount).toLocaleString("vi-VN") + " đ";
  const totalTr = document.createElement("tr");
  totalTr.className = "row-total";
  totalTr.innerHTML = `
    <td style="text-align: center;">∑</td>
    <td><strong style="color: #1e40af; font-size: 14px;">TỔNG CỘNG</strong></td>
    <td><strong style="color: #dc2626; font-size: 14px;">${totalErrors} kiện</strong></td>
    <td></td>
    <td><strong style="color: #b91c1c; font-size: 14px;">${formattedTotalMoney}</strong></td>
    <td></td>
  `;
  reportBody.appendChild(totalTr);
}

function renderGroupReportTable() {
  const groupBody = document.getElementById("group-report-body");
  if (!groupBody) return;
  groupBody.innerHTML = "";

  const groupMap = {};
  let totalErrors = 0;
  let totalAmount = 0;

  rawData.forEach((item) => {
    let g = (item.nhom || "").trim();
    if (!g || g === "Nội bộ kho") {
      g = "Chưa được xử lý";
    }

    let qty = Number(item.soLuongSai) || 0;
    let money = Number(item.tongTien) || 0;

    if (!groupMap[g]) {
      groupMap[g] = { nhom: g, qty: 0, amount: 0, isUnprocessed: g === "Chưa được xử lý" };
    }
    groupMap[g].qty += qty;
    groupMap[g].amount += money;

    if (g !== "Chưa được xử lý") {
      totalErrors += qty;
      totalAmount += money;
    }
  });

  let processedGroups = Object.values(groupMap)
    .filter((item) => !item.isUnprocessed)
    .sort((a, b) => b.amount - a.amount);

  let unhandledGroups = Object.values(groupMap).filter((item) => item.isUnprocessed);
  let finalSortedList = [...processedGroups, ...unhandledGroups];

  finalSortedList.forEach((item, index) => {
    let formattedAmount = Number(item.amount).toLocaleString("vi-VN") + " đ";
    let errRateBadge = "";
    let amountRateBadge = "";
    let noteStatus = "";

    if (item.isUnprocessed) {
      errRateBadge = '<span style="color: #64748b; font-weight: 600;">-</span>';
      amountRateBadge = '<span style="color: #64748b; font-weight: 600;">-</span>';
      noteStatus =
        '<span class="badge-status" style="color: #b45309; border-color: #fcd34d; background-color: #fefce8; font-weight: 700;">⚠️ Cần kiểm tra</span>';
    } else {
      let errRate = totalErrors > 0 ? ((item.qty / totalErrors) * 100).toFixed(2) : "0.00";
      let amountRate = totalAmount > 0 ? ((item.amount / totalAmount) * 100).toFixed(2) : "0.00";
      errRateBadge = `<span class="badge-percent-blue">${errRate}%</span>`;
      amountRateBadge = `<span class="badge-percent-red">${amountRate}%</span>`;

      noteStatus = '<span class="badge-status">Cần lưu ý</span>';
      if (parseFloat(errRate) >= 25) {
        noteStatus =
          '<span class="badge-status" style="color: #ea580c; border-color: #fdba74; background-color: #fff7ed;">⚠️ Tỷ lệ lỗi cao nhất</span>';
      } else if (parseFloat(amountRate) >= 25) {
        noteStatus =
          '<span class="badge-status" style="color: #dc2626; border-color: #fca5a5; background-color: #fef2f2;">🚨 Tiền đền cao nhất</span>';
      }
    }

    const tr = document.createElement("tr");
    if (item.isUnprocessed) {
      tr.style.backgroundColor = "#fffbeb";
    }

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${item.nhom}</strong></td>
      <td><strong style="color: ${item.isUnprocessed ? "#b45309" : "#dc2626"};">${item.qty} kiện</strong></td>
      <td>${errRateBadge}</td>
      <td><strong style="color: #b91c1c;">${formattedAmount}</strong></td>
      <td>${amountRateBadge}</td>
      <td>${noteStatus}</td>
    `;
    groupBody.appendChild(tr);
  });

  let formattedTotalMoney = Number(totalAmount).toLocaleString("vi-VN") + " đ";
  const totalTr = document.createElement("tr");
  totalTr.className = "row-total";
  totalTr.innerHTML = `
    <td style="text-align: center;">∑</td>
    <td><strong style="color: #1e40af; font-size: 14px;">TỔNG CỘNG (ĐÃ XỬ LÝ)</strong></td>
    <td><strong style="color: #dc2626; font-size: 14px;">${totalErrors} kiện</strong></td>
    <td></td>
    <td><strong style="color: #b91c1c; font-size: 14px;">${formattedTotalMoney}</strong></td>
    <td></td>
    <td></td>
  `;
  groupBody.appendChild(totalTr);
}
