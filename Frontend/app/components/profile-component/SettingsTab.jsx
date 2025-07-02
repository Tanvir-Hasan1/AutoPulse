import { View, Text, TouchableOpacity, Switch, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useUser } from "../../contexts/UserContext";
import { router } from "expo-router";

const SettingsTab = ({ notificationSettings, toggleNotification, styles }) => {
  const navigation = useNavigation();
  const { clearUser } = useUser();

  const handleSignOut = () => {
    clearUser();
    router.replace("/(auth)/LoginPage");
  };

  return (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <Text style={styles.sectionDescription}>
          Manage how you receive alerts
        </Text>
      </View>
      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Maintenance Reminders</Text>
            <Text style={styles.settingDescription}>
              Get alerts for scheduled maintenance
            </Text>
          </View>
          <Switch
            value={notificationSettings.maintenance}
            onValueChange={() => toggleNotification("maintenance")}
            trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
            thumbColor={
              notificationSettings.maintenance ? "#10B981" : "#9CA3AF"
            }
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Low Fuel Alerts</Text>
            <Text style={styles.settingDescription}>
              Notify when fuel level is below 20%
            </Text>
          </View>
          <Switch
            value={notificationSettings.fuel}
            onValueChange={() => toggleNotification("fuel")}
            trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
            thumbColor={notificationSettings.fuel ? "#10B981" : "#9CA3AF"}
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Marketplace Updates</Text>
            <Text style={styles.settingDescription}>
              Receive alerts for new listings matching your interests
            </Text>
          </View>
          <Switch
            value={notificationSettings.marketplace}
            onValueChange={() => toggleNotification("marketplace")}
            trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
            thumbColor={
              notificationSettings.marketplace ? "#10B981" : "#9CA3AF"
            }
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Performance Insights</Text>
            <Text style={styles.settingDescription}>
              Weekly summary of your bike's performance
            </Text>
          </View>
          <Switch
            value={notificationSettings.performance}
            onValueChange={() => toggleNotification("performance")}
            trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
            thumbColor={
              notificationSettings.performance ? "#10B981" : "#9CA3AF"
            }
          />
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Document Expiry Alerts</Text>
            <Text style={styles.settingDescription}>
              Get notified before documents expire
            </Text>
          </View>
          <Switch
            value={notificationSettings.documents}
            onValueChange={() => toggleNotification("documents")}
            trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
            thumbColor={notificationSettings.documents ? "#10B981" : "#9CA3AF"}
          />
        </View>
      </View>
      <View style={styles.settingsFooter}>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings" size={20} color="#4F46E5" />
          <Text style={styles.settingsButtonText}>Account Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.settingsButton, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out" size={20} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default SettingsTab;
