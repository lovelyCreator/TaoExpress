import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Image, Rect } from 'react-native-svg';

interface SvgLogoProps {
  size?: number;
}

const SvgLogo: React.FC<SvgLogoProps> = ({ size = 100 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 328 328" fill="none">
        <Defs>
          <Pattern
            id="pattern0_83_9277"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <Image
              id="image0_83_9277"
              width="1024"
              height="1024"
              preserveAspectRatio="none"
              href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAQACAYAAAB/HSuDAAEAAElEQVR4Xuz9ebxteV7X978/n+/a+5xzh7p1p7q3qmvoqp5AhgYUJRojJsGISXBiUEGjEBQSY2YkEkw0ItIgQjQtImpwTmImzU8iZDKGqJjIJCAN3V3VXfOturfueM7Ze30/n98fn+8651bR3emxeqjX81G39j5r+K7hnL32+ny+w5IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
              transform="scale(0.000976562)"
            />
          </Pattern>
        </Defs>
        <Rect width="328" height="328" fill="url(#pattern0_83_9277)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SvgLogo;

