// create a function call which returns an array of devices, each device has a name, a start hour of day, an end hour of day and the number of hours needed to charge
function getDevices() {
    return [
        { name: 'Volvo XC40', start: -1, end: -1, hours: 3.5 }]};

// create a function that returns the average price given an array of octopus price slots
function getAveragePrice(octopusPrices) {
    let total = 0;
    octopusPrices.forEach((slot) => {
        total += slot.value_inc_vat;
    });
    return total / octopusPrices.length;
}

// given an array of octopus price data filter between a start and end hour, if start is -1 don't check start if end is -1 don't check end
function filterOctopusPrices(octopusPriceData, start, end) {
    return octopusPriceData.filter((slot) => {
        let slotTime = new Date(slot.timestamp);
        let slotTimeHours = slotTime.getHours();
        if (start === -1 && end === -1) {
            return true;
        } else if (start === -1) {
            return slotTimeHours <= end;
        } else if (end === -1) {
            return slotTimeHours >= start;
        } else {
            return slotTimeHours >= start && slotTimeHours <= end;
        }
    });
}


function getTimeSlots(prices, hours ) {
    let timeSlots = [];
    let timeSlot = {};
    let periods = hours * 2;
    
    // iterate through prices array using for loop
    for (let i = 0; i < prices.length - periods; i++) {
        tempPrices = [];
        timestampTo = prices[i]["timestamp_to"];
        for (let j = 0; j < periods; j++) {
            tempPrices.push(prices[i + j]);
            timestampTo = prices[i+j]["timestamp_to"];
        }
        average = getAveragePrice(tempPrices);
        timeSlot = { timestamp : prices[i].timestamp, timestamp_to : timestampTo,  average: average };
        timeSlots.push(timeSlot);
    }

    // return time slots sorted by average price
    return timeSlots.sort((a, b) => a.average - b.average);
}

//for each device create a map of name, start, end, hours needed and the matching time slots
function processDeviceData(octopusPrices) {
    devices = getDevices();
    let deviceTimeSlots = [];
    devices.forEach((device) => {
        let deviceTimeSlot = {};
        deviceTimeSlot.name = device.name;
        deviceTimeSlot.start = device.start;
        deviceTimeSlot.end = device.end;
        deviceTimeSlot.hours = device.hours;
        deviceTimeSlot.prices = getTimeSlots(filterOctopusPrices(octopusPrices, device.start, device.end),device.hours);
        deviceTimeSlots.push(deviceTimeSlot);
    });
    return deviceTimeSlots;
}

function getAveragePrices(octopusPrices) {
    let hours = [1, 2, 3, 4];
    let timeSlot = {};
    let averages = [];

    for (let j = 0; j < hours.length; j++) {
        timeSlots = []
        periods = hours[j] * 2;
        // iterate through prices array using for loop up to maximum hours
        for (let i = 0; i < octopusPrices.length - periods; i++) {
            tempAveragePrices = [];
            tempPrices = [];
            for (let k = 0; k < periods; k++) {
                if (i + k >= octopusPrices.length) {
                    break;
                }
                tempPrices.push(octopusPrices[i + k]);
            }
            averagePrice = getAveragePrice(tempPrices);
            //timeSlot = { timestamp : octopusPrices[i].timestamp, averagePrice: averagePrice };
            timeSlots.push(averagePrice);
        }
        averages.push({hours : hours[j], averagePrices : timeSlots});
    }
    return averages;
}
av