import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import FullscreenChartModal from "./FullscreenChartModal";

const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

const Reports = ({
  visiblePieData = [],
  fuelPriceTrend = [],
  fuelConsumptionTrend = [],
  monthlyExpenseTrend = [],
  pieData = [],
  themeColors = {},
}) => {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  // Landscape calculations for fullscreen modal preview
  const landscapeWidth = screenHeight - 80;
  const landscapeHeight = screenWidth - 32;
  const landscapeChartWidth = landscapeWidth - 40;
  const landscapeChartHeight = landscapeHeight - 85;

  const slideWidth = screenWidth * 0.88;
  const chartWidth = slideWidth - 64; // Spacing for padding inside screenWidth card

  const [activeSlide, setActiveSlide] = useState(0);
  const [fullscreenChart, setFullscreenChart] = useState(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const index = Math.round(offset / slideWidth);
    if (index >= 0 && index <= 3 && index !== activeSlide) {
      setActiveSlide(index);
    }
  };

  const getCardAnimation = (index) => {
    const inputRange = [
      (index - 1) * slideWidth,
      (index - 0.5) * slideWidth,
      index * slideWidth,
      (index + 0.5) * slideWidth,
      (index + 1) * slideWidth,
    ];

    // Card general scale (normal downscale on sides)
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.84, 0.92, 1.0, 0.92, 0.84],
      extrapolate: "clamp",
    });

    // Horizontal stretch during swipe (water drop/liquid effect)
    const scaleX = scrollX.interpolate({
      inputRange,
      outputRange: [1.0, 1.08, 1.0, 1.08, 1.0],
      extrapolate: "clamp",
    });

    // Vertical squeeze during swipe (water drop/liquid effect)
    const scaleY = scrollX.interpolate({
      inputRange,
      outputRange: [1.0, 0.92, 1.0, 0.92, 1.0],
      extrapolate: "clamp",
    });

    // Fade out slightly on sides
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 0.8, 1.0, 0.8, 0.6],
      extrapolate: "clamp",
    });

    // Lift cards vertically
    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [12, 6, 0, 6, 12],
      extrapolate: "clamp",
    });

    // 3D rotation tilt
    const rotateY = scrollX.interpolate({
      inputRange,
      outputRange: ["10deg", "5deg", "0deg", "-5deg", "-10deg"],
      extrapolate: "clamp",
    });

    // Pull neighboring cards closer to prevent empty gaps and overlap them
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [
        -slideWidth * 0.12,
        -slideWidth * 0.06,
        0,
        slideWidth * 0.06,
        slideWidth * 0.12,
      ],
      extrapolate: "clamp",
    });

    return {
      opacity,
      transform: [
        { perspective: 1000 },
        { translateX },
        { translateY },
        { rotateY },
        { scale },
        { scaleX },
        { scaleY },
      ],
    };
  };

  const dotInputRange = [
    0,
    0.5 * slideWidth,
    slideWidth,
    1.5 * slideWidth,
    2 * slideWidth,
    2.5 * slideWidth,
    3 * slideWidth,
  ];

  const activeDotTranslateX = scrollX.interpolate({
    inputRange: dotInputRange,
    outputRange: [0, 8, 16, 24, 32, 40, 48],
    extrapolate: "clamp",
  });

  const activeDotScaleX = scrollX.interpolate({
    inputRange: dotInputRange,
    outputRange: [1.0, 3.0, 1.0, 3.0, 1.0, 3.0, 1.0],
    extrapolate: "clamp",
  });

  const activeDotScaleY = scrollX.interpolate({
    inputRange: dotInputRange,
    outputRange: [1.0, 0.8, 1.0, 0.8, 1.0, 0.8, 1.0],
    extrapolate: "clamp",
  });

  const chartConfig = {
    backgroundGradientFrom: themeColors.cardBackground,
    backgroundGradientTo: themeColors.cardBackground,
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
    labelColor: () => themeColors.chartText,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
    propsForDots: {
      r: "4",
      strokeWidth: "1",
      stroke: "#2563EB",
    },
  };

  const lineChartConfig = {
    ...chartConfig,
  };

  const barChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Green bars for consumption
  };

  return (
    <View style={styles.carouselContainer}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={Platform.OS === "ios"}
        nestedScrollEnabled={true}
        style={{ width: screenWidth }}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          {
            useNativeDriver: true,
            listener: handleScroll,
          }
        )}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - slideWidth) / 2,
        }}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        disableIntervalMomentum={true}
      >
        {/* SLIDE 1: Expenses Ratio */}
        <View style={[styles.slideWrapper, { width: slideWidth }]}>
          <Animated.View
            style={[
              styles.slideCard,
              {
                backgroundColor: themeColors.cardBackground,
                ...getCardAnimation(0),
              },
            ]}
          >
            <View style={styles.slideHeader}>
              <Text style={[styles.slideTitle, { color: themeColors.title }]}>Expenses Ratio</Text>
              {visiblePieData.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFullscreenChart({ type: "ratio", title: "Expenses Ratio" });
                  }}
                  style={styles.expandButton}
                >
                  <Ionicons name="expand-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>
            {visiblePieData.length > 0 ? (
              <View style={styles.pieLayout}>
                <View style={styles.pieWrapper}>
                  <PieChart
                    data={visiblePieData}
                    width={slideWidth * 0.42}
                    height={120}
                    chartConfig={chartConfig}
                    accessor="population"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    hasLegend={false}
                  />
                </View>
                <View style={styles.legendContainer}>
                  {pieData.map((item, idx) => (
                    <View key={idx} style={styles.legendRow}>
                      <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                      <View>
                        <Text style={[styles.legendLabel, { color: themeColors.textSecondary }]}>{item.name}</Text>
                        <Text style={[styles.legendVal, { color: themeColors.textPrimary }]}>
                          {item.population.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} BDT
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.noChartData}>
                <Text style={[styles.noChartText, { color: themeColors.textSecondary }]}>No expense logs recorded yet.</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* SLIDE 2: Fuel Price */}
        <View style={[styles.slideWrapper, { width: slideWidth }]}>
          <Animated.View
            style={[
              styles.slideCard,
              {
                backgroundColor: themeColors.cardBackground,
                ...getCardAnimation(1),
              },
            ]}
          >
            <View style={styles.slideHeader}>
              <Text style={[styles.slideTitle, { color: themeColors.title }]}>Fuel Price</Text>
              {fuelPriceTrend.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFullscreenChart({ type: "price", title: "Fuel Price" });
                  }}
                  style={styles.expandButton}
                >
                  <Ionicons name="expand-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>
            {fuelPriceTrend.length > 0 ? (
              <LineChart
                data={{
                  labels: fuelPriceTrend.map((d) => {
                    const parts = d.date.split("-");
                    const monthIndex = parseInt(parts[1], 10) - 1;
                    return `${monthNames[monthIndex]} ${parts[2]}`;
                  }),
                  datasets: [{ data: fuelPriceTrend.map((d) => d.unitCost) }],
                }}
                width={chartWidth}
                height={120}
                chartConfig={lineChartConfig}
                bezier
                withInnerLines={false}
                withOuterLines={false}
                style={styles.chart}
              />
            ) : (
              <View style={styles.noChartData}>
                <Text style={[styles.noChartText, { color: themeColors.textSecondary }]}>No fuel price logs available.</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* SLIDE 3: Fuel Consumption */}
        <View style={[styles.slideWrapper, { width: slideWidth }]}>
          <Animated.View
            style={[
              styles.slideCard,
              {
                backgroundColor: themeColors.cardBackground,
                ...getCardAnimation(2),
              },
            ]}
          >
            <View style={styles.slideHeader}>
              <Text style={[styles.slideTitle, { color: themeColors.title }]}>Fuel Consumption (Litres)</Text>
              {fuelConsumptionTrend.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFullscreenChart({ type: "consumption", title: "Fuel Consumption (Litres)" });
                  }}
                  style={styles.expandButton}
                >
                  <Ionicons name="expand-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>
            {fuelConsumptionTrend.length > 0 ? (
              <BarChart
                data={{
                  labels: fuelConsumptionTrend.map((d) => {
                    const parts = d.month.split("-");
                    return monthNames[parseInt(parts[1], 10) - 1];
                  }),
                  datasets: [{ data: fuelConsumptionTrend.map((d) => d.litres) }],
                }}
                width={chartWidth}
                height={120}
                chartConfig={barChartConfig}
                withInnerLines={false}
                style={styles.chart}
              />
            ) : (
              <View style={styles.noChartData}>
                <Text style={[styles.noChartText, { color: themeColors.textSecondary }]}>No consumption logs available.</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* SLIDE 4: Monthly Expense */}
        <View style={[styles.slideWrapper, { width: slideWidth }]}>
          <Animated.View
            style={[
              styles.slideCard,
              {
                backgroundColor: themeColors.cardBackground,
                ...getCardAnimation(3),
              },
            ]}
          >
            <View style={styles.slideHeader}>
              <Text style={[styles.slideTitle, { color: themeColors.title }]}>Monthly Expense (BDT)</Text>
              {monthlyExpenseTrend.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFullscreenChart({ type: "expense", title: "Monthly Expense (BDT)" });
                  }}
                  style={styles.expandButton}
                >
                  <Ionicons name="expand-outline" size={18} color="#2563EB" />
                </TouchableOpacity>
              )}
            </View>
            {monthlyExpenseTrend.length > 0 ? (
              <LineChart
                data={{
                  labels: monthlyExpenseTrend.map((d) => {
                    const parts = d.month.split("-");
                    return monthNames[parseInt(parts[1], 10) - 1];
                  }),
                  datasets: [{ data: monthlyExpenseTrend.map((d) => d.spending) }],
                }}
                width={chartWidth}
                height={120}
                chartConfig={lineChartConfig}
                bezier
                withInnerLines={false}
                withOuterLines={false}
                style={styles.chart}
              />
            ) : (
              <View style={styles.noChartData}>
                <Text style={[styles.noChartText, { color: themeColors.textSecondary }]}>No expense trends available.</Text>
              </View>
            )}
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* Slide Pagination Indicator Dots */}
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((idx) => (
          <View
            key={idx}
            style={[
              styles.dot,
              styles.inactiveDot,
              { backgroundColor: themeColors.dotInactive },
            ]}
          />
        ))}
        <Animated.View
          style={{
            position: "absolute",
            left: 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#2563EB",
            transform: [
              { translateX: activeDotTranslateX },
              { scaleX: activeDotScaleX },
              { scaleY: activeDotScaleY },
            ],
          }}
        />
      </View>

      {/* Fullscreen Chart Modal */}
      <FullscreenChartModal
        visible={fullscreenChart !== null}
        onClose={() => setFullscreenChart(null)}
        fullscreenChart={fullscreenChart}
        visiblePieData={visiblePieData}
        pieData={pieData}
        fuelPriceTrend={fuelPriceTrend}
        fuelConsumptionTrend={fuelConsumptionTrend}
        monthlyExpenseTrend={monthlyExpenseTrend}
        themeColors={themeColors}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
    overflow: "visible",
  },
  slideWrapper: {
    paddingHorizontal: 16,
  },
  slideCard: {
    borderRadius: 16,
    padding: 16,
    width: "100%",
    minHeight: 180,
    justifyContent: "space-between",
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 3,
  },
  slideTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  slideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  expandButton: {
    padding: 4,
  },
  pieLayout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pieWrapper: {
    flex: 1.1,
    alignItems: "center",
    justifyContent: "center",
  },
  legendContainer: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  legendVal: {
    fontSize: 13,
    fontWeight: "700",
  },
  chart: {
    marginLeft: -10,
    borderRadius: 16,
  },
  noChartData: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  noChartText: {
    fontSize: 14,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
    width: 64,
    alignSelf: "center",
    position: "relative",
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 20,
    backgroundColor: "#2563EB", // active pill dot
  },
  inactiveDot: {
    width: 8,
  },
});

export default Reports;
