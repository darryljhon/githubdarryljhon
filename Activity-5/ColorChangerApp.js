import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ColorChangerApp = () => {
  const [backgroundColor, setBackgroundColor] = useState('white');

  const handleSetColor = (color) => {
    setBackgroundColor(color);
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={styles.title}>Color Changer App</Text>
      <View style={styles.buttonContainer}>
        <Button title="White" onPress={() => handleSetColor('white')} />
        <Button title="Light Blue" onPress={() => handleSetColor('lightblue')} />
        <Button title="Light Green" onPress={() => handleSetColor('lightgreen')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 10, // Added vertical margin for spacing
    padding: 20,
    width: '80%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});

export default ColorChangerApp;
