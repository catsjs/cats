import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import prettyMs from 'pretty-ms';
import styled, { useTheme } from 'styled-components';
// import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import { VictoryPie, VictoryLabel } from 'victory';
// import { Tooltip } from '@material-ui/core';

import { media } from '../../../../style/theme';

const Wrap = styled.div`
    display: none;
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;

    ${media.greaterThan('small')`
      display: block;
    `}
`;

const SuiteChart = ({
    totalPasses,
    totalFailures,
    totalPending,
    totalSkipped,
    size,
    duration,
}) => {
    const theme = useTheme();

    const total = totalPasses + totalFailures + totalPending + totalSkipped;

    const initData = [
        { x: 'Passes', y: 0, fill: theme.color.green500 },
        { x: 'Failures', y: 0, fill: theme.color.red500 },
        { x: 'Pending', y: 0, fill: theme.color.ltblue500 },
        { x: 'Skipped', y: 0, fill: theme.color.black38 },
        { x: 'Unused', y: 100, fill: theme.color.white },
    ];

    const data = useMemo(
        () => [
            {
                x: 'Passes',
                y: (totalPasses / total) * 100,
                label: totalPasses,
                fill: theme.color.green500,
            },
            {
                x: 'Failures',
                y: (totalFailures / total) * 100,
                label: totalFailures,
                fill: theme.color.red500,
            },
            {
                x: 'Pending',
                y: (totalPending / total) * 100,
                label: totalPending,
                fill: theme.color.ltblue500,
            },
            {
                x: 'Skipped',
                y: (totalSkipped / total) * 100,
                label: totalSkipped,
                fill: theme.color.black38,
            },
            { x: 'Unused', y: 0, fill: theme.color.white },
        ],
        [
            theme.color.black38,
            theme.color.green500,
            theme.color.ltblue500,
            theme.color.red500,
            theme.color.white,
            total,
            totalFailures,
            totalPasses,
            totalPending,
            totalSkipped,
        ]
    );

    const [d, setD] = useState(initData);

    useEffect(() => {
        setD(data);
    }, [data]);

    return (
        <Wrap size={size}>
            <svg viewBox={`0 0 ${size} ${size}`}>
                <VictoryPie
                    standalone={false}
                    width={size}
                    height={size}
                    startAngle={180}
                    endAngle={540}
                    data={d}
                    radius={size / 2}
                    innerRadius={size / 2 - 12.5}
                    labelRadius={({ innerRadius }) => innerRadius + 6.25}
                    labelComponent={
                        <VictoryLabel
                            textAnchor='middle'
                            verticalAnchor='middle'
                        />
                    }
                    labels={({ datum }) =>
                        datum.label ? `${datum.label}` : ''
                    }
                    style={{
                        labels: {
                            fill: 'white',
                            fontFamily: theme.typography.fontFamily,
                            fontSize: 12,
                            fontWeight: 700,
                        },
                        data: { fill: ({ datum }) => datum.fill },
                    }}
                    padAngle={0.5}
                    animate={{ duration: 2000, easing: 'quadOut' }}
                />
                <VictoryLabel
                    textAnchor='middle'
                    style={{
                        fill: theme.color.black38,
                        fontFamily: theme.typography.fontFamily,
                        fontSize: 12,
                    }}
                    x={size / 2}
                    y={size / 2}
                    text={prettyMs(duration, {
                        unitCount: 3,
                    })}
                />
            </svg>
        </Wrap>
    );
};

SuiteChart.propTypes = {
    totalPasses: PropTypes.number,
    totalFailures: PropTypes.number,
    totalPending: PropTypes.number,
    totalSkipped: PropTypes.number,
    size: PropTypes.number.isRequired,
    duration: PropTypes.number,
};

SuiteChart.defaultProps = {
    totalPasses: 0,
    totalFailures: 0,
    totalPending: 0,
    totalSkipped: 0,
    duration: 0,
};

SuiteChart.displayName = 'SuiteChart';

export default React.memo(SuiteChart);
