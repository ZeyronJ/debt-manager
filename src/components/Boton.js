import { Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function Boton({ color, text, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.Boton, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  Boton: {
    padding: 7,
    borderRadius: 10,
  },
});
