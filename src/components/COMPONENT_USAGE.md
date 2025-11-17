# Button and TextInput Component Usage Guide

## Button Component

The Button component is a flexible, reusable button that supports multiple variants, sizes, and custom styling.

### Props

- `title` (string, required): Button text
- `onPress` (function, required): Function to call when button is pressed
- `disabled` (boolean, optional): Disable the button
- `loading` (boolean, optional): Show loading indicator
- `variant` ('primary' | 'secondary' | 'outline' | 'danger', optional): Button style variant
- `size` ('small' | 'medium' | 'large', optional): Button size
- `style` (ViewStyle, optional): Custom container styles
- `textStyle` (TextStyle, optional): Custom text styles
- `activeOpacity` (number, optional): Touch opacity (default: 0.8)
- `leftIcon` (string, optional): Ionicons name for left icon
- `rightIcon` (string, optional): Ionicons name for right icon
- `leftImage` (ImageSourcePropType, optional): Image source for left image
- `rightImage` (ImageSourcePropType, optional): Image source for right image
- `leftElement` (React.ReactNode, optional): Custom left element/component
- `rightElement` (React.ReactNode, optional): Custom right element/component
- `iconSize` (number, optional): Size of icons (default: 20)
- `iconColor` (string, optional): Color of icons

### Usage Examples

```tsx
import { Button } from '../../components';

// Basic usage
<Button
  title="Login"
  onPress={handleLogin}
/>

// With variant and loading
<Button
  title="Submit"
  onPress={handleSubmit}
  variant="danger"
  loading={isLoading}
/>

// Custom styles
<Button
  title="Custom Button"
  onPress={handlePress}
  variant="outline"
  size="large"
  style={{ marginTop: 20, borderRadius: 8 }}
  textStyle={{ fontSize: 18, fontWeight: 'bold' }}
/>

// Disabled state
<Button
  title="Disabled"
  onPress={handlePress}
  disabled={true}
/>

// With left icon
<Button
  title="Login with Apple"
  onPress={handleAppleLogin}
  variant="outline"
  leftIcon="logo-apple"
  iconColor="#000000"
/>

// With right icon
<Button
  title="Next"
  onPress={handleNext}
  variant="primary"
  rightIcon="arrow-forward"
/>

// With left image
<Button
  title="Continue"
  onPress={handleContinue}
  leftImage={require('./assets/logo.png')}
/>

// With custom left element
<Button
  title="Google"
  onPress={handleGoogleLogin}
  variant="outline"
  leftElement={<GoogleIcon width={20} height={20} />}
/>

// Social login button example
<Button
  title="Facebook"
  onPress={handleFacebookLogin}
  variant="outline"
  size="small"
  leftIcon="logo-facebook"
  iconColor="#1877F2"
  style={{ flex: 1 }}
/>
```

## TextInput Component

The TextInput component is a flexible input field with label, error handling, and icon support.

### Props

Extends all React Native TextInput props, plus:

- `label` (string, optional): Input label text
- `error` (string, optional): Error message to display
- `containerStyle` (ViewStyle, optional): Custom container styles
- `inputStyle` (TextStyle, optional): Custom input styles
- `labelStyle` (TextStyle, optional): Custom label styles
- `errorStyle` (TextStyle, optional): Custom error text styles
- `showError` (boolean, optional): Show/hide error message (default: true)
- `secureTextEntry` (boolean, optional): Hide text for passwords
- `onToggleSecure` (function, optional): Function to toggle password visibility
- `showSecureToggle` (boolean, optional): Show eye icon for password toggle
- `leftIcon` (string, optional): Ionicons name for left icon
- `rightIcon` (string, optional): Ionicons name for right icon
- `onRightIconPress` (function, optional): Function for right icon press

### Usage Examples

```tsx
import { TextInput } from '../../components';

// Basic usage
<TextInput
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>

// With error
<TextInput
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  error={errors.password}
/>

// Password field with toggle
<TextInput
  label="Password"
  placeholder="Enter password"
  value={password}
  onChangeText={setPassword}
  secureTextEntry={showPassword}
  onToggleSecure={() => setShowPassword(!showPassword)}
  showSecureToggle={true}
/>

// With custom styles
<TextInput
  label="Username"
  placeholder="Enter username"
  value={username}
  onChangeText={setUsername}
  containerStyle={{ marginBottom: 20 }}
  inputStyle={{ fontSize: 16 }}
  labelStyle={{ color: '#FF6B9D', fontWeight: 'bold' }}
/>

// With icons
<TextInput
  placeholder="Search..."
  value={search}
  onChangeText={setSearch}
  leftIcon="search-outline"
  rightIcon="close-circle"
  onRightIconPress={() => setSearch('')}
/>
```

## Complete Form Example

```tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, TextInput } from '../../components';

const MyForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    // Your submit logic here
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <TextInput
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (errors.password) setErrors({ ...errors, password: '' });
        }}
        secureTextEntry={showPassword}
        onToggleSecure={() => setShowPassword(!showPassword)}
        showSecureToggle={true}
        error={errors.password}
      />

      <Button
        title="Submit"
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  submitButton: {
    marginTop: 10,
  },
});
```

## Styling Tips

1. **Button variants**: Use 'primary' for main actions, 'danger' for destructive actions, 'outline' for secondary actions
2. **Custom colors**: Override styles using the `style` and `textStyle` props
3. **Error handling**: The TextInput automatically shows red borders when error prop is provided
4. **Responsive sizing**: Use the `size` prop on Button for consistent sizing across your app
5. **Icons**: Use Ionicons names for leftIcon and rightIcon props
