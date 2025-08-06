let devices = [{ name: 'Volvo XC40', start: -1, end: -1, hours: 3.5 }];

// create a function call which returns an array of devices, each device has a name, a start hour of day, an end hour of day and the number of hours needed to charge
function getDevices() {
    return devices
};

function addDevice(name, start, end, hours) {
    devices.push({ name: name, start: start, end: end, hours: hours });
}
    
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


//for each device create a map of name, start, end, hours needed and the matching time slots
function processDeviceData(octopusPrices) {
    devices = getDevices();
    let deviceTimeSlots = [];
    devices.forEach((device) => {
        let deviceTimeSlot = {};
        let averagePrices = getAveragePricesForPeriodSortedByAverage(filterOctopusPrices(octopusPrices, device.start, device.end),device.hours*2);
        deviceTimeSlot.name = device.name;
        deviceTimeSlot.start = device.start;
        deviceTimeSlot.end = device.end;
        deviceTimeSlot.hours = device.hours;
        deviceTimeSlot.prices = averagePrices; 
        deviceTimeSlots.push(deviceTimeSlot);
    });
    return deviceTimeSlots;
}


function getAveragePrices(octopusPrices) {
    let periods = [1, 2, 3, 4, 6, 7];
    let averages = [];

    for (let j = 0; j < periods.length; j++) {
        averages.push({periods : periods[j], averagePrices : getAveragePricesForPeriod(octopusPrices, periods[j])});
    }
    return averages;
}

function getAveragePricesForPeriod(octopusPrices, periods) {
    let timeSlots = [];
    for (let i = 0; i < octopusPrices.length - periods; i++) {
        let tempPrices = [];
        let timestampTo = octopusPrices[i]["timestamp_to"];
        for (let j = 0; j < periods; j++) {
            if (i + j >= octopusPrices.length) {
                break;
            }
            tempPrices.push(octopusPrices[i + j]);
            timestampTo = octopusPrices[i+j]["timestamp_to"];
        }
        const averagePrice = getAveragePrice(tempPrices);
        const timeSlot = { timestamp : octopusPrices[i].timestamp, timestamp_to : timestampTo, average: averagePrice };
        timeSlots.push(timeSlot);
    }
    return timeSlots;
}

function getAveragePricesForPeriodSortedByAverage(octopusPrices, periods) {
    let timeSlots = getAveragePricesForPeriod(octopusPrices, periods);
    return timeSlots.sort((a, b) => a.average - b.average);
}