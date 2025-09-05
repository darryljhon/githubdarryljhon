import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native'; //Import ScrollView
import CounterApp from './CounterApp';
import ColorChangerApp from './ColorChangerApp';

const App = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CounterApp />
      <ColorChangerApp />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items from the top
    paddingVertical: 20, // Add some vertical padding
  borderColor:"#ccc",
  },
});

export default App;
