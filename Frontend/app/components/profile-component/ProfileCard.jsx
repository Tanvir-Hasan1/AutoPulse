import { View, Text, TouchableOpacity } from "react-native";

const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const ProfileCard = ({ user, styles }) => {
  // Format join date as 'Month Day, Year' if possible
  let joinDateFormatted = user.createdAt;
  if (user.createdAt && !isNaN(Date.parse(user.createdAt))) {
    joinDateFormatted = new Date(user.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  // Use initials from name if avatar is not provided
  const avatar = user.avatar || getInitials(user.name);
  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{avatar}</Text>
      </View>
      <Text style={styles.userName}>{user.name}</Text>
      <Text style={styles.joinDate}>Joined {joinDateFormatted}</Text>
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileCard;
