// src/components/Icon.js
import React from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
} from '@expo/vector-icons';

// Generic Icon Component supporting multiple libraries
const Icon = ({ iconSet = 'Ionicons', name, size, color }) => {
  switch (iconSet) {
    case 'MaterialCommunityIcons':
      return <MaterialCommunityIcons name={name} size={size} color={color} />;
    case 'FontAwesome':
      return <FontAwesome name={name} size={size} color={color} />;
    case 'AntDesign':
      return <AntDesign name={name} size={size} color={color} />;
    case 'Ionicons': // Default case
    default:
      return <Ionicons name={name} size={size} color={color} />;
  }
};

export default Icon;