/**
 * Octopus Energy Agile Price Tracker - Chart.js Utilities
 * Handles chart creation and updates
 */

/**
 * Prepare data for the price chart
 */
function preparePriceChartData() {
    
    // Extract labels (times) and prices
    const labels = priceData.map(price => {
        const time = new Date(price.timestamp);
        return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    });
    
    const prices = priceData.map(price => price.value_inc_vat);
    
    // Generate background colors based on price categories
    const backgroundColors = priceData.map(price => {
        switch(price.price_category) {
            case 'very_low':
                return 'rgba(0, 128, 0, 0.5)';  // Dark green
            case 'low':
                return 'rgba(40, 167, 69, 0.5)';  // Light green
            case 'medium':
                return 'rgba(255, 193, 7, 0.5)';  // Amber
            case 'high':
                return 'rgba(255, 140, 0, 0.5)';  // Orange
            case 'very_high':
                return 'rgba(220, 53, 69, 0.5)';  // Red
            default:
                return 'rgba(108, 117, 125, 0.5)';  // Gray
        }
    });
    
    const borderColors = priceData.map(price => {
        switch(price.price_category) {
            case 'very_low':
                return 'rgb(0, 128, 0)';
            case 'low':
                return 'rgb(40, 167, 69)';
            case 'medium':
                return 'rgb(255, 193, 7)';
            case 'high':
                return 'rgb(255, 140, 0)';
            case 'very_high':
                return 'rgb(220, 53, 69)';
            default:
                return 'rgb(108, 117, 125)';
        }
    });
    
    return {
        labels: labels,
        datasets: [
            {
                label: 'Price (p/kWh)',
                data: prices,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }
        ]
    };
}

/**
 * Create the price chart
 */
function createPriceChart(chartData) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (priceChart) {
        priceChart.destroy();
    }
    
    // Create new chart
    priceChart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const idx = tooltipItems[0].dataIndex;
                            //const timeStr = chartData.labels[idx];

                            
                            // Add date information if available
                            if (priceData[idx] && priceData[idx].timestamp) {
                                const priceTime = new Date(priceData[idx].timestamp);
                                const displayDate = priceTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short'});
                                const timeStr = priceTime.toLocaleTmeString('en-GB', { hour: '2-digit', minute: '2-digit'});
                                return `${displayDate} ${timeStr}`;
                            }
                            return timeStr;
                        },
                        label: function(context) {
                            return `Price: ${context.raw.toFixed(2)}p/kWh`;
                        },
                        afterLabel: function(context) {
                            const idx = context.dataIndex;
                            if (priceData[idx]) {
                                return `Category: ${getPriceCategoryDisplay(priceData[idx].price_category)}`;
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Price (p/kWh)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            }
        }
    });
    
    // Mark current time on chart if viewing today
    if (currentPeriod === 'now' || currentPeriod === 'today') {
        markCurrentTimeOnChart();
    }
}

/**
 * Mark the current time on the chart with a vertical line annotation
 */
function markCurrentTimeOnChart() {
    // This functionality requires Chart.js annotation plugin
    // For simplicity, we're not implementing this right now
}

/**
 * Get display name for price category
 */
function getPriceCategoryDisplay(category) {
    switch(category) {
        case 'very_low':
            return 'Very Low';
        case 'low':
            return 'Low';
        case 'medium':
            return 'Medium';
        case 'high':
            return 'High';
        case 'very_high':
            return 'Very High';
        default:
            return 'Unknown';
    }
}
