// create a function call which returns an array of devices, each device has a name, a start hour of day, an end hour of day and the number of hours needed to charge
function getDevices() {
    return [
        { name: 'Volvo XC40', start: -1, end: -1, hours: 3.5 },
        { name: 'Volvo XC40 morning', start: 11, end: 13, hours: 2 },
        { name: 'Dishwasher', start: 20, end: 23, hours: 1.5 },
        { name: 'Water Heater', start: -1, end: -1, hours: 2 },
        { name: 'Cheapest Slot', start: -1, end: -1, hours: 1 }]};

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


function getTimeSlots(prices, hours) {
    let timeSlots = [];
    let timeSlot = {};
    
    // iterate through prices array using for loop
    for (let i = 0; i < prices.length - (hours*2); i++) {
        tempPrices = [];
        timestampTo = prices[i]["timestamp_to"];
        for (let j = 1; j < hours*2; j++) {
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
        deviceTimeSlot.prices = getTimeSlots(octopusPrices, device.hours);
        deviceTimeSlots.push(deviceTimeSlot);
    });
    return deviceTimeSlots;
}
