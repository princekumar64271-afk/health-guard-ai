# Health-Guard AI — Medical Intelligence Web Application

A modern, high-precision laboratory analysis and medical report evaluation dashboard designed with a HealthTech SaaS UI/UX.

---

## 📁 File Structure
- `index.html`: Fully self-contained web app with all screens, modern styling, clinical logic, and database hooks.

---

## 🚀 How to Run
1. Navigate to this folder:
   ```
   C:\Users\ASUS\.gemini\antigravity\scratch\health-guard-ai\
   ```
2. Double-click on `index.html` to open it directly in any browser (Chrome, Edge, Firefox, Brave).
3. (Optional) Run with Live Server or `npx serve .` for local HTTP hosting.

---

## 🗄️ Database Integration Guide

This frontend has been engineered to preserve **100% of the IDs, form elements, and state flow**, so you can easily connect your database (MongoDB, PostgreSQL, MySQL, Supabase, Firebase) without modifying DOM references.

Inside `index.html`, search for `DATABASE INTEGRATION POINT`:

### 1. User Authentication (`login()`)
- **Location**: Line ~490
- **Input Elements**:
  - `#email`: User email input
  - `#pw`: User password input
- **Integration Example**:
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, pw })
});
const data = await response.json();
if (data.token) {
  localStorage.setItem('auth_token', data.token);
  // Proceed to dashboard
}
```

### 2. PDF Report Upload (`handleFile(files)`)
- **Location**: Line ~535
- **Input Element**:
  - `#fileInput`: File object (`files[0]`)
- **Integration Example**:
```javascript
const formData = new FormData();
formData.append('report_file', files[0]);
const res = await fetch('/api/reports/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 3. Save Analysis & Results (`computeResults()`)
- **Location**: Line ~580
- **Data Payload Available**:
  - `currentResults`: Array of parameters (`hb`, `wbc`, `rbc`, etc.) with user values and classification (`normal`, `low`, `high`).
  - `currentInsights`: Object with detected conditions, suggested tests, precautions, and recommended specialist.
- **Integration Example**:
```javascript
await fetch('/api/reports/save', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    patient_id: '10492',
    date: new Date().toISOString(),
    results: currentResults,
    insights: currentInsights
  })
});
```

---

## 🛡️ Screen Overview
1. **Login Screen (`#screen-login`)**: Encrypted access portal.
2. **Dashboard Screen (`#screen-dashboard`)**: Metrics overview, recent reports log.
3. **Upload Screen (`#screen-upload`)**: PDF dropzone + 7-parameter manual input grid.
4. **Analysis Screen (`#screen-analysis`)**: Color-coded laboratory metrics & clinical reference check.
5. **Insights Screen (`#screen-insights`)**: AI differential considerations, precautions, nearby doctor directory.
6. **Report Screen (`#screen-report`)**: Standardized clinical printable/downloadable summary.
