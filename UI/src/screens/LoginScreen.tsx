import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, ScrollView, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberPassword, setRememberPassword] = useState<boolean>(false);
  const [obscurePassword, setObscurePassword] = useState<boolean>(true);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.loginCard}>
            
            {/* Header tương ứng Flutter Column */}
            <View style={styles.headerSection}>
              <Text style={styles.titleText}>Welcome Back</Text>
              <Text style={styles.subtitleText}>Login to your mobile account</Text>
            </View>

            {/* Email Field */}
            <Text style={styles.label}>Gmail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput}
                placeholder="Enter your Gmail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Field */}
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={obscurePassword}
              />
              <TouchableOpacity onPress={() => setObscurePassword(!obscurePassword)}>
                <Ionicons 
                  name={obscurePassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Options Row: Remember & Forgot */}
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.checkboxContainer} 
                onPress={() => setRememberPassword(!rememberPassword)}
              >
                <Ionicons 
                  name={rememberPassword ? "checkbox" : "square-outline"} 
                  size={22} color="#2563EB" 
                />
                <Text style={styles.rememberText}>Remember password</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={styles.forgotText}>Forgot?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In Button */}
            <TouchableOpacity style={styles.signInBtn} activeOpacity={0.8}>
              <Text style={styles.signInBtnText}>Sign In</Text>
            </TouchableOpacity>

            {/* Divider "or" */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign In */}
            <TouchableOpacity style={styles.googleBtn}>
              <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.googleBtnText}>Sign in with Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don’t have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signUpText}>Sign up</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FB' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    // Shadow cho iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    // Shadow cho Android
    elevation: 4,
  },
  headerSection: { alignItems: 'center', marginBottom: 32 },
  titleText: { fontSize: 28, fontWeight: 'bold', color: '#1E1E1E' },
  subtitleText: { fontSize: 14, color: '#9E9E9E', marginTop: 8 },
  label: { fontWeight: '600', fontSize: 15, color: '#1E1E1E', marginBottom: 10, marginTop: 20 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F9FC',
    borderRadius: 16,
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, fontSize: 15, color: '#333' },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, alignItems: 'center' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { marginLeft: 8, fontSize: 14, color: '#444' },
  forgotText: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
  signInBtn: {
    backgroundColor: '#2563EB',
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  orText: { marginHorizontal: 10, color: '#9E9E9E' },
  googleBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  googleBtnText: { fontWeight: '600', fontSize: 15, color: '#333' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#9E9E9E', fontSize: 14 },
  signUpText: { color: '#2563EB', fontWeight: 'bold', fontSize: 14 },
});