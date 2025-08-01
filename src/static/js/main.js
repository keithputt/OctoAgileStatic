/**
 * Octopus Energy Agile Price Tracker - Main JavaScript
 * Handles UI interactions and data fetching
 */

// Keep track of the current view period
let currentPeriod = 'now';
let priceData = [];
let priceChart = null;
let averagePriceData = [];
let averagePriceChart = null;

let deviceData = [];
let devicePriceData = [];

// DOM elements
const currentViewTitle = document.getElementById('current-view-title');
const currentTimeElement = document.getElementById('current-time');
const currentPriceElement = document.getElementById('current-price');
const chartLoading = document.getElementById('chart-loading');
const chartError = document.getElementById('chart-error');
const errorMessage = document.getElementById('error-message');
const cheapestTimesList = document.getElementById('cheapest-times-list');
const cheapestLoading = document.getElementById('cheapest-loading');
const expensiveTimesList = document.getElementById('expensive-times-list');
const expensiveLoading = document.getElementById('expensive-loading');
const priceTableBody = document.getElementById('price-table-body');
const deviceTableBody = document.getElementById('device-table-body');

// Navigation links
const navLinks = document.querySelectorAll('[data-period]');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up current time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 60000); // Update every minute
    
    // Add event listeners to navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', handlePeriodChange);
    });
    
    // Load initial data for today
    loadPriceData('now');
});

/**
 * Update the current time display
 */
function updateCurrentTime() {
    const now = new Date();
    currentTimeElement.textContent = now.toLocaleTimeString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    // Update current price if we have data
    if (priceData.length > 0) {
        updateCurrentPrice();
    }
}

/**
 * Handle period change when user clicks navigation links
 */
function handlePeriodChange(event) {
    event.preventDefault();
    
    // Get selected period
    const period = this.getAttribute('data-period');
    
    // Update active navigation link
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    this.classList.add('active');
    
    // Update current period and load data
    currentPeriod = period;
    loadPriceData(period);
    
    // Update title
    updateViewTitle(period);
}

/**
 * Update the view title based on selected period
 */
function updateViewTitle(period) {
    switch(period) {
        case 'today':
            currentViewTitle.textContent = "Today's Prices";
            break;
        case 'tomorrow':
            currentViewTitle.textContent = "Tomorrow's Prices";
            break;
        case 'yesterday':
            currentViewTitle.textContent = "Yesterday's Prices";
            break;
        case 'now':
            currentViewTitle.textContent = "Current Prices";
            break;
        default:
            currentViewTitle.textContent = "Energy Prices";
    }
}

/**
 * Load price data from the API
 */
function loadPriceData(period) {
    // Show loading indicators
    showPricesLoading(true);
    
        // call loadOctopusPrices and when it returns update the priceData variable
    loadOctopusPrices(period).then(data => {
        priceData = data;
        averagePriceData = getAveragePrices(priceData); 
        // Update UI components
        updateCurrentPrice();
        updatePriceTable();
        updateCheapestTimes();
        updateExpensiveTimes();
        updatePriceChart();
        updateAveragePriceChart();

        // Hide loading indicators
        showPricesLoading(false);

	loadDeviceData();
    }).catch(error => {
        console.error('Error fetching price data:', error);
        showError(error.message);
    });
}

/**
 * Load device data from the API
 */
function loadDeviceData() {
    // Show loading indicators
    showDevicesLoading(true);
    deviceData = processDeviceData(priceData);	    

    // Update UI components
    updateDeviceTable();                
    // Hide loading indicators
    showDevicesLoading(false);
}

/**
 * Show or hide prices loading indicators
 */
function showPricesLoading(isLoading) {
    if (isLoading) {
        chartLoading.style.display = 'block';
        chartError.classList.add('d-none');
        cheapestLoading.style.display = 'block';
        expensiveLoading.style.display = 'block';
        cheapestTimesList.innerHTML = '';
        expensiveTimesList.innerHTML = '';
        priceTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div><span class="ms-2">Loading prices...</span></td></tr>';
    } else {
        chartLoading.style.display = 'none';
        cheapestLoading.style.display = 'none';
        expensiveLoading.style.display = 'none';
    }
}

/**
 * Show or hide devices loading indicators
 */
function showDevicesLoading(isLoading) {
    if (isLoading) {
        deviceTableBody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary" role="status"><span class="visually-hidden">Loading...</span></div><span class="ms-2">Loading devices...</span></td></tr>';
    } else {

    }
}

/**
 * Show error message
 */
function showError(message) {
    chartLoading.style.display = 'none';
    chartError.classList.remove('d-none');
    errorMessage.textContent = message;

    // Show error in other components too
    cheapestLoading.style.display = 'none';
    expensiveLoading.style.display = 'none';
    cheapestTimesList.innerHTML = '<li class="list-group-item text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error loading data</li>';
    expensiveTimesList.innerHTML = '<li class="list-group-item text-danger"><i class="fas fa-exclamation-circle me-2"></i>Error loading data</li>';
    priceTableBody.innerHTML = `<tr><td colspan="4" class="text-center text-danger"><i class="fas fa-exclamation-circle me-2"></i>${message}</td></tr>`;
}

/**
 * Update the current price display
 */
function updateCurrentPrice() {
    const now = new Date();
    
    // Find the current price slot
    const currentPriceData = priceData.find(price => {
        const priceTime = new Date(price.timestamp);
        const nextSlot = new Date(priceTime);
        nextSlot.setMinutes(nextSlot.getMinutes() + 30);
        
        return now >= priceTime && now < nextSlot;
    });
    
    if (currentPriceData) {
        const price = currentPriceData.value_inc_vat.toFixed(2);
        currentPriceElement.textContent = `${price}p/kWh`;
        
        // Set badge color based on price category
        currentPriceElement.className = 'badge';
        switch(currentPriceData.price_category) {
            case 'very_low':
                currentPriceElement.classList.add('bg-success');
                break;
            case 'low':
                currentPriceElement.classList.add('bg-success');
                break;
            case 'medium':
                currentPriceElement.classList.add('bg-warning');
                break;
            case 'high':
                currentPriceElement.classList.add('bg-danger');
                break;
            case 'very_high':
                currentPriceElement.classList.add('bg-danger');
                break;
            default:
                currentPriceElement.classList.add('bg-secondary');
        }
    } else {
        currentPriceElement.textContent = 'Not Available';
        currentPriceElement.className = 'badge bg-secondary';
    }
}

/**
 * Update the price table with all price slots
 */
function updatePriceTable() {
    priceTableBody.innerHTML = '';
    
    if (priceData.length === 0) {
        priceTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No price data available</td></tr>';
        return;
    }
    
    // Sort data by timestamp
    const sortedData = [...priceData].sort((a, b) => {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    // Add rows for each price slot
    sortedData.forEach(price => {
        const priceTime = new Date(price.timestamp);
        display_date = priceTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
        display_time = priceTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        
        const row = document.createElement('tr');
        
        // Determine if this is the current time slot
        const now = new Date();
        const nextSlot = new Date(priceTime);
        nextSlot.setMinutes(nextSlot.getMinutes() + 30);
        const isCurrentSlot = now >= priceTime && now < nextSlot;
        
        if (isCurrentSlot) {
            row.classList.add('table-active');
        }
        
        // Date column
        const dateCell = document.createElement('td');
        dateCell.textContent = display_date;
        row.appendChild(dateCell);
        
        // Time column
        const timeCell = document.createElement('td');
        timeCell.textContent = display_time;
        if (isCurrentSlot) {
            const currentBadge = document.createElement('span');
            currentBadge.className = 'badge bg-info ms-2';
            currentBadge.textContent = 'Current';
            timeCell.appendChild(currentBadge);
        }
        row.appendChild(timeCell);
        
        // Price column
        const priceCell = document.createElement('td');
        priceCell.textContent = price.value_inc_vat.toFixed(2);
        row.appendChild(priceCell);
        
        // Category column
        const categoryCell = document.createElement('td');
        categoryCell.className = 'text-end';
        
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'badge';
        
        switch(price.price_category) {
            case 'very_low':
                categoryBadge.classList.add('very-low-bg');
                categoryBadge.textContent = 'Very Low';
                break;
            case 'low':
                categoryBadge.classList.add('low-bg');
                categoryBadge.textContent = 'Low';
                break;
            case 'medium':
                categoryBadge.classList.add('medium-bg');
                categoryBadge.textContent = 'Medium';
                break;
            case 'high':
                categoryBadge.classList.add('high-bg');
                categoryBadge.textContent = 'High';
                break;
            case 'very_high':
                categoryBadge.classList.add('very-high-bg');
                categoryBadge.textContent = 'Very High';
                break;
            default:
                categoryBadge.classList.add('bg-secondary');
                categoryBadge.textContent = 'Unknown';
        }
        
        categoryCell.appendChild(categoryBadge);
        row.appendChild(categoryCell);
        
        priceTableBody.appendChild(row);
    });
}

/**
 * Update the cheapest times list
 */
function updateCheapestTimes() {
    cheapestTimesList.innerHTML = '';
    
    if (priceData.length === 0) {
        cheapestTimesList.innerHTML = '<li class="list-group-item">No price data available</li>';
        return;
    }
    
    // Sort data by price (ascending)
    const sortedData = [...priceData].sort((a, b) => {
        return a.value_inc_vat - b.value_inc_vat;
    });
    
    // Take top 5 cheapest times
    const cheapestTimes = sortedData.slice(0, 5);
    
    // Add items for each cheap time slot
    cheapestTimes.forEach(price => {
        const priceTime = new Date(price.timestamp);
        
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        display_date = priceTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
        display_time = priceTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        const timeSpan = document.createElement('span');
        timeSpan.innerHTML = `<i class="fas fa-clock me-2"></i>${display_date} ${display_time}`;
   
        
        const priceSpan = document.createElement('span');
        priceSpan.className = 'badge bg-success rounded-pill';
        priceSpan.textContent = `${price.value_inc_vat.toFixed(2)}p/kWh`;
        
        listItem.appendChild(timeSpan);
        listItem.appendChild(priceSpan);
        
        cheapestTimesList.appendChild(listItem);
    });
}

/**
 * Update the most expensive times list
 */
function updateExpensiveTimes() {
    expensiveTimesList.innerHTML = '';
    
    if (priceData.length === 0) {
        expensiveTimesList.innerHTML = '<li class="list-group-item">No price data available</li>';
        return;
    }
    
    // Sort data by price (descending)
    const sortedData = [...priceData].sort((a, b) => {
        return b.value_inc_vat - a.value_inc_vat;
    });
    
    // Take top 5 most expensive times
    const expensiveTimes = sortedData.slice(0, 5);
    
    // Add items for each expensive time slot
    expensiveTimes.forEach(price => {
        const priceTime = new Date(price.timestamp);
              
        display_date = priceTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
        display_time = priceTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const timeSpan = document.createElement('span');
        timeSpan.innerHTML = `<i class="fas fa-clock me-2"></i>${display_date} ${display_time}`;
        
        const priceSpan = document.createElement('span');
        priceSpan.className = 'badge bg-danger rounded-pill';
        priceSpan.textContent = `${price.value_inc_vat.toFixed(2)}p/kWh`;
        
        listItem.appendChild(timeSpan);
        listItem.appendChild(priceSpan);
        
        expensiveTimesList.appendChild(listItem);
    });
}

/**
 * Update the price chart
 */
function updatePriceChart() {
    // Get chart data
    const chartData = preparePriceChartData();
    
    // Update or create chart
    if (priceChart) {
        priceChart.data = chartData;
        priceChart.update();
    } else {
        createPriceChart(chartData);
    }
}

/**
 * Update the price chart
 */
function updateAveragePriceChart() {
    // Get chart data
    const averageChartData = prepareAveragePriceChartData();
    
    // Update or create chart
    if (averagePriceChart) {
        averagePriceChart.data = averageChartData;
        averagePriceChart.update();
    } else {
        createAveragePriceChart(averageChartData);
    }
}

/**
 * Update the device table with all devices
 */
function updateDeviceTable() {
    deviceTableBody.innerHTML = '';
    
    if (deviceData.length === 0) {
        deviceTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No device data available</td></tr>';
        return;
    }
    
    
    // Add rows for each device
    // iterare over the deviceData map
    deviceData.forEach(device => {


        const row = document.createElement('tr');
        
        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = device.name;
        nameCell.style.fontStyle = 'italic';
        nameCell.style.color = 'yellow'
        row.appendChild(nameCell);
        
        // Start Time column
        const startTimeCell = document.createElement('td');
        startTimeCell.textContent = device.start;
        startTimeCell.style.fontStyle = 'italic';
        startTimeCell.style.color = 'yellow';
        row.appendChild(startTimeCell);
 
        // End Time column
        const endTimeCell = document.createElement('td');
        endTimeCell.textContent = device.end;
        endTimeCell.style.fontStyle = 'italic';
        endTimeCell.style.color = 'yellow';
        row.appendChild(endTimeCell);

        // End TimeNumber of hours column
        const hoursCell = document.createElement('td');
        hoursCell.textContent = device.hours;
        hoursCell.style.fontStyle = 'italic';
        hoursCell.style.color = 'yellow';
        hoursCell.colSpan = 2; // Span across two columns
        hoursCell.style.textAlign = 'left';
        row.appendChild(hoursCell);

        /* Max Price column
        const maxPriceCell = document.createElement('td');
        maxPriceCell.textContent = device.max_price.toFixed(2);
        maxPriceCell.style.fontStyle = 'italic';
        maxPriceCell.style.color = 'yellow';
        row.appendChild(maxPriceCell);*/

        deviceTableBody.appendChild(row);
        
        let i = 0;
        device.prices.forEach(price => {
            i++;
            if (i <= 3) {
                const priceRow = document.createElement('tr');
                
                // Device Name column
                const blankCell = document.createElement('td');
                blankCell.textContent = '';
                priceRow.appendChild(blankCell);
                
                // Start Time column
                const priceStartCell = document.createElement('td');
                const priceStartTime = new Date(price.timestamp);
                const startDisplayDate = priceStartTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
                const startDisplayTime = priceStartTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                priceStartCell.textContent = startDisplayTime + ' on ' + startDisplayDate;
                priceRow.appendChild(priceStartCell);
                
                // End Time column 
                const priceEndCell = document.createElement('td');
                const priceEndTime = new Date(price.timestamp_to);
                const endDisplayDate = priceEndTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
                const endDisplayTime = priceEndTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                priceEndCell.textContent = endDisplayTime + ' on ' + endDisplayDate
                priceEndCell.colSpan = 2;
                priceRow.appendChild(priceEndCell);
                
                // Average column
                const averageCell = document.createElement('td');
                averageCell.textContent = `${price.average.toFixed(2)}`;
                priceRow.appendChild(averageCell);
                
                deviceTableBody.appendChild(priceRow);
            }
            
        }); 
    });
}
