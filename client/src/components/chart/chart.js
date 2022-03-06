import * as React from 'react';
import {LineChart, Line} from 'recharts';

function Chart(props) {

    let min = Math.min(...props.candles.prices);
    let obj = props.candles.prices.map((value, idx) => {
        return {x: props.candles.timestamps[idx], y: value - min};
    })

    return <LineChart width={200} height={50} data={obj}>
        <Line type="linear" dataKey="y" isAnimationActive={false} stroke={props.trend ? '#009671' : '#ff1b1b'} dot={false} strokeWidth={3}/>
    </LineChart>;
}

export default Chart;