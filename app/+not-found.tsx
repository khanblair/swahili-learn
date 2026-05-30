import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Screen not found</Text>
      <TouchableOpacity onPress={() => router.replace('/')} style={styles.btn}>
        <Text style={styles.btnText}>Go home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  text: { fontSize: 18, color: '#3C3C3C' },
  btn: { backgroundColor: '#58CC02', borderRadius: 16, paddingHorizontal: 24, paddingVertical: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
});
