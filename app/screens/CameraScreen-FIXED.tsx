// app/screens/CameraScreen.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { X, Image as ImageIcon, Camera, CheckCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export const CameraScreen = ({ route, navigation }: any) => {
  const { challengeId, challengeTitle } = route.params || {};
  const [facing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const cameraRef = useRef<any>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need camera permission</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setCapturedPhoto(photo.uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setCapturedPhoto(result.assets[0].uri);
    }
  };

  const retake = () => {
    setCapturedPhoto(null);
  };

  const submitProof = async () => {
    setIsSubmitting(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      
      // Wait 1.5s then navigate back to Profile
      setTimeout(() => {
        // Clear all state
        setCapturedPhoto(null);
        setShowSuccess(false);
        
        // Navigate to Profile tab
        navigation.navigate('Profile', {
          screen: 'ProfileMain',
          params: { refresh: true }
        });
      }, 1500);
    }, 1000);
  };

  const handleClose = () => {
    setCapturedPhoto(null);
    setShowSuccess(false);
    navigation.goBack();
  };

  // Success state
  if (showSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.successContainer}>
          <LinearGradient
            colors={['#14F195', '#0EA97F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successIcon}
          >
            <CheckCircle size={48} color="#000000" />
          </LinearGradient>
          <Text style={styles.successTitle}>Proof Submitted!</Text>
          <Text style={styles.successSubtitle}>Redirecting...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Submit Proof</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera or Photo Preview */}
      {capturedPhoto ? (
        <Image source={{ uri: capturedPhoto }} style={styles.preview} />
      ) : (
        <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
      )}

      {/* Bottom Controls */}
      <View style={styles.bottomControls}>
        {capturedPhoto ? (
          // Photo captured - show retake and submit
          <>
            <TouchableOpacity style={styles.retakeButton} onPress={retake}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={submitProof}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={['#14F195', '#0EA97F']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#000000" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Proof</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          // No photo - show gallery and capture
          <>
            <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
              <View style={styles.galleryCircle}>
                <ImageIcon size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureOuter}>
                <View style={styles.captureInner} />
              </View>
            </TouchableOpacity>
            
            <View style={{ width: 60 }} />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  camera: {
    flex: 1,
  },
  preview: {
    flex: 1,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
  },
  galleryButton: {
    width: 60,
    height: 60,
  },
  galleryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
  },
  captureOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },
  retakeButton: {
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retakeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#555555',
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 20,
  },
  permissionButton: {
    backgroundColor: '#14F195',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
