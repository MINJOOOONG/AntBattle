import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface BarData {
  label: string;
  value: number;
  color: string;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
}

export default function MiniBarChart({ data, height = 120 }: MiniBarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const chartWidth = barCount * 60;
  const barWidth = 32;
  const labelHeight = 20;
  const valueHeight = 16;
  const barAreaHeight = height - labelHeight - valueHeight;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={height}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * barAreaHeight;
          const x = index * 60 + (60 - barWidth) / 2;
          const y = valueHeight + barAreaHeight - barHeight;

          return (
            <React.Fragment key={item.label}>
              <SvgText
                x={index * 60 + 30}
                y={valueHeight - 4}
                fontSize={12}
                fontWeight="bold"
                fill={item.color}
                textAnchor="middle"
              >
                {item.value}
              </SvgText>
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx={4}
                fill={item.color}
                opacity={0.85}
              />
              <SvgText
                x={index * 60 + 30}
                y={height - 2}
                fontSize={11}
                fill={COLORS.textSecondary}
                textAnchor="middle"
              >
                {item.label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
});
