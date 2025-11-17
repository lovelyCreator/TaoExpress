import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GoogleIconProps {
  width?: number;
  height?: number;
}

const GoogleIcon: React.FC<GoogleIconProps> = ({ width = 20, height = 20 }) => (
  <Svg width={width} height={height} viewBox="0 0 533.5 544.3">
    <Path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-36.7-4.9-54.1H272v102.4h146.9c-6.3 34-25 62.8-53.3 82v68.1h86.1c50.4-46.5 81.8-115.1 81.8-198.4z"/>
    <Path fill="#34A853" d="M272 106.1c39.7-.6 78 14 107.1 40.7l80.1-80.1C415.6 24.3 346.2 0 272 0 166.4 0 74.9 59 30.5 173.1l88.7 70.5C140.8 154 201 106.1 272 106.1z"/>
    <Path fill="#FBBC05" d="M119.2 323.6c-10.1-30-10.1-62.5 0-92.5v-70.5H30.5c-41.3 82.7-41.3 150.8 0 233.5l88.7-70.5z"/>
    <Path fill="#EA4335" d="M272 544.3c72.9 0 134.1-24.1 178.8-65.9l-86.1-68.1c-23.9 16.1-54.6 25.6-92.7 25.6-71 0-131.2-47.9-152.8-112.3H30.5v70.5C74.9 485.2 166.4 544.3 272 544.3z"/>
  </Svg>
);

export default GoogleIcon;


