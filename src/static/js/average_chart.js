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
    let maxDataSets = 8;

    // iterate through averagePriceData and add to dataSets
    averagePriceData.forEach((price, index) => {
        // break if index is greater than maxDataSets
        if (index >= maxDataSets) {
            return dataSets;
        }

        const backgroundColor = rainbowStop(index/Math.min(averagePriceData.length, maxDataSets));

        const averagePrices = price.averagePrices.map(averagePrice => {
            return averagePrice.average;
        });

        dataSets.push({
            label: `Average Price for ${(price.periods/2).toFixed(1)} hours`,
            data: averagePrices,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
        });

    });
    

    
    return {
        labels: labels,
        datasets: dataSets
    };
}

function rainbowStop(h) 
{
  let f= (n,k=(n+h*12)%12) => .5-.5*Math.max(Math.min(k-3,9-k,1),-1);  
  let rgb2hex = (r,g,b) => "#"+[r,g,b].map(x=>Math.round(x*255).toString(16).padStart(2,0)).join('');
  return ( rgb2hex(f(0), f(8), f(4)) );
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
        
    averagePriceChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true
                }

            },
            scales: {
                y: {
                    beginAtZero: false,
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
