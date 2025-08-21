export class ExportModal {
  constructor() {
    this.element = this.createElement();
    this.isVisible = false;
    this.onExport = null;
  }

  createElement() {
    const modal = document.createElement('div');
    modal.className = 'modal export-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2 class="modal-title">Export Data</h2>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <div class="export-format">
              <h3>Select Format</h3>
              <div class="format-buttons">
                <button class="btn btn-export" data-format="txt">
                  📝 Text File
                  <small>Perfect for WhatsApp sharing</small>
                </button>
                <button class="btn btn-export" data-format="csv">
                  📊 CSV File
                  <small>Import into Excel or Google Sheets</small>
                </button>
              </div>
            </div>
            
            <div class="export-range">
              <h3>Date Range</h3>
              <div class="range-options">
                <label class="range-option">
                  <input type="radio" name="dateRange" value="today" checked>
                  <span>Today only</span>
                </label>
                <label class="range-option">
                  <input type="radio" name="dateRange" value="week">
                  <span>This week</span>
                </label>
                <label class="range-option">
                  <input type="radio" name="dateRange" value="month">
                  <span>This month</span>
                </label>
                <label class="range-option">
                  <input type="radio" name="dateRange" value="custom">
                  <span>Custom range</span>
                </label>
              </div>
              
              <div class="custom-range" id="customRange" style="display: none;">
                <div class="form-group">
                  <label>From Date</label>
                  <input type="date" id="fromDate" class="form-input">
                </div>
                <div class="form-group">
                  <label>To Date</label>
                  <input type="date" id="toDate" class="form-input">
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" id="cancelExport">Cancel</button>
          <button class="btn btn-primary" id="confirmExport">Export</button>
        </div>
      </div>
    `;
    
    this.bindEvents();
    return modal;
  }

  bindEvents() {
    const closeBtn = this.element.querySelector('.modal-close');
    const cancelBtn = this.element.querySelector('#cancelExport');
    const confirmBtn = this.element.querySelector('#confirmExport');
    const customRangeRadio = this.element.querySelector('input[value="custom"]');
    const customRangeDiv = this.element.querySelector('#customRange');
    
    closeBtn.addEventListener('click', () => this.hide());
    cancelBtn.addEventListener('click', () => this.hide());
    confirmBtn.addEventListener('click', () => this.handleExport());
    
    // Show/hide custom date range
    this.element.addEventListener('change', (e) => {
      if (e.target.name === 'dateRange') {
        customRangeDiv.style.display = e.target.value === 'custom' ? 'block' : 'none';
      }
    });
    
    // Close on backdrop click
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) this.hide();
    });
    
    // Format button clicks
    this.element.addEventListener('click', (e) => {
      if (e.target.closest('[data-format]')) {
        const formatBtns = this.element.querySelectorAll('[data-format]');
        formatBtns.forEach(btn => btn.classList.remove('selected'));
        e.target.closest('[data-format]').classList.add('selected');
      }
    });
  }

  show() {
    this.isVisible = true;
    this.element.classList.add('show');
    document.body.classList.add('no-scroll');
    
    // Set default dates
    const today = new Date();
    const fromDate = this.element.querySelector('#fromDate');
    const toDate = this.element.querySelector('#toDate');
    
    if (fromDate) fromDate.valueAsDate = today;
    if (toDate) toDate.valueAsDate = today;
    
    // Focus first format button
    const firstFormatBtn = this.element.querySelector('[data-format]');
    if (firstFormatBtn) {
      firstFormatBtn.classList.add('selected');
      firstFormatBtn.focus();
    }
  }

  hide() {
    this.isVisible = false;
    this.element.classList.remove('show');
    document.body.classList.remove('no-scroll');
    this.reset();
  }

  reset() {
    // Reset form to defaults
    const todayRadio = this.element.querySelector('input[value="today"]');
    if (todayRadio) todayRadio.checked = true;
    
    const customRange = this.element.querySelector('#customRange');
    if (customRange) customRange.style.display = 'none';
    
    const formatBtns = this.element.querySelectorAll('[data-format]');
    formatBtns.forEach(btn => btn.classList.remove('selected'));
  }

  handleExport() {
    const selectedFormat = this.element.querySelector('[data-format].selected');
    const selectedRange = this.element.querySelector('input[name="dateRange"]:checked');
    
    if (!selectedFormat) {
      alert('Please select a format');
      return;
    }
    
    const exportOptions = {
      format: selectedFormat.dataset.format,
      range: selectedRange.value
    };
    
    if (exportOptions.range === 'custom') {
      const fromDate = this.element.querySelector('#fromDate').value;
      const toDate = this.element.querySelector('#toDate').value;
      
      if (!fromDate || !toDate) {
        alert('Please select both start and end dates');
        return;
      }
      
      exportOptions.fromDate = fromDate;
      exportOptions.to
