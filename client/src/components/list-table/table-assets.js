function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}


const headCells = [
    {
        id: 'symbol',
        numeric: false,
        disablePadding: true,
        label: 'Name',
    },

    {
        id: 'charts',
        numeric: true,
        disablePadding: true,
        label: '48h chart',
    },

    {
        id: 'sharesAmount',
        numeric: true,
        disablePadding: true,
        label: 'Shares',
    },

    {
        id: 'price',
        numeric: true,
        disablePadding: true,
        label: 'Current price',
    },
    {
        id: 'change',
        numeric: true,
        disablePadding: true,
        label: 'Day change',
    },
    {
        id: 'dayGain',
        numeric: true,
        disablePadding: true,
        label: 'Day gain',
    },
    {
        id: 'gain',
        numeric: true,
        disablePadding: true,
        label: 'Gain',
    },
    {
        id: 'value',
        numeric: true,
        disablePadding: true,
        label: 'Value',
    },
    {
        id: 'delete',
        numeric: true,
        disablePadding: true,
        label: '',
    },
];

const processTableData = (data) => {

    const dataTotals = {
        priceTotal: 0,
        buyPriceTotal: 0,
        dayGainTotal: 0,
        valueTotal: 0
    }

    const dataProcessed = data.map(item => {

        let changePrc = (((item.price / (item.price - item.change)) - 1));
        let dayGain = (item.sharesAmount * item.change);
        let gain = (item.sharesAmount * (item.price - item.buyPrice));
        let gainPrc = item.buyPrice !== 0 ? (((item.price / item.buyPrice) - 1)) : 0;
        let value = (item.price * item.sharesAmount);

        dataTotals.priceTotal += item.price * item.sharesAmount;
        dataTotals.buyPriceTotal += item.buyPrice * item.sharesAmount;
        dataTotals.dayGainTotal += dayGain;
        dataTotals.valueTotal += value;

        return {
            ...item,
            price: item.price,
            change: item.change,
            buyPrice: item.buyPrice,
            changePrc: changePrc,
            dayGain: dayGain,
            gain: gain,
            gainPrc: gainPrc,
            value: value
        }

    });

    dataProcessed.push({
        price: null,
        change: null,
        changePrc: null,
        dayGain: dataTotals.dayGainTotal,
        gain: dataTotals.priceTotal - dataTotals.buyPriceTotal,
        gainPrc: (((dataTotals.priceTotal / dataTotals.buyPriceTotal) - 1)),
        value: dataTotals.valueTotal,
        symbol: null,
        name: null,
        sharesAmount: null,
        buyPrice: null,
    });

    return dataProcessed;

}

export {descendingComparator, getComparator, headCells, processTableData};