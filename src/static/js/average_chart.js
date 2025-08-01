/**
 * Octopus Energy Agile Price Tracker - Chart.js Utilities
 * Handles chart creation and updates
 */

/**
 * Prepare data for the price chart
 */
function prepareAveragePriceChartData() {
    
    // Extract labels (times) and prices
    const labels = priceData.map(price => {
        const time = new Date(price.timestamp);
        return time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    });
    
    let dataSets = [];
    // iterate through averagePriceData and add to dataSets
    averagePriceData.forEach((price, index) => {
        dataSets.push({
            label: `Average Price for ${price.hours} hours`,
            data: price.averagePrices,
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
        });
    });
    

    
    return {
        labels: labels,
        datasets: dataSets
    };
}

/**
 * Create the price chart
 */
function createAveragePriceChart(chartData) {
    const ctx = document.getElementById('averagePriceChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (averagePriceChart) {
        averagePriceChart.destroy();
    }
    
    // Create new chart
    averagePriceChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
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
}
