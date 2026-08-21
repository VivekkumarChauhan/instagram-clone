import React, { forwardRef, useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, rightIcon, containerStyle, isPassword = false, ...props }, ref) => {
    const [secureText, setSecureText] = useState(isPassword);
    const [isFocused, setIsFocused] = useState(false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.inputWrapper, isFocused && styles.focused, error ? styles.errorBorder : null]}>
          <TextInput
            ref={ref}
            style={styles.input}
            placeholderTextColor="#8E8E93"
            secureTextEntry={secureText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity onPress={() => setSecureText(p => !p)} style={styles.eyeIcon}>
              <Text style={styles.eyeText}>{secureText ? '👁' : '🙈'}</Text>
            </TouchableOpacity>
          )}
          {rightIcon && !isPassword && <View style={styles.rightIconContainer}>{rightIcon}</View>}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    paddingHorizontal: 14,
    height: 50,
  },
  focused: {
    borderColor: '#E1306C',
  },
  errorBorder: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  eyeText: {
    fontSize: 18,
  },
  rightIconContainer: {
    marginLeft: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
});
