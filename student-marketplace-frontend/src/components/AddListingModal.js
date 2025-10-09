import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { listingsAPI } from '../services/api';
import { addListingModalStyles } from '../styles/AddListingModalStyles';

const AddListingModal = ({ visible, onClose, onListingAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSelectedImage(null);
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    console.log('🖼️ Pick image button pressed!');
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          { text: 'Camera', onPress: openCamera },
          { text: 'Photo Library', onPress: openImageLibrary },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('❌ Error in pickImage:', error);
      Alert.alert('Error', 'Something went wrong with image picker');
    }
  };

  const openCamera = async () => {
    console.log('📷 Opening camera...');
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });

      console.log('📷 Camera result:', result);
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('❌ Camera error:', error);
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    console.log('📚 Opening image library...');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });

      console.log('📚 Library result:', result);
      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('❌ Library error:', error);
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return false;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return false;
    }
    if (!category.trim()) {
      Alert.alert('Error', 'Please enter a category');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        photo: selectedImage ? `data:image/jpeg;base64,${selectedImage.base64}` : null,
      };

      console.log('📝 Creating listing:', {
        ...listingData,
        photo: selectedImage ? `Image attached (${selectedImage.base64.length} chars)` : 'No image'
      });

      const result = await listingsAPI.createListing(listingData);
      
      if (result.success) {
        Alert.alert('Success', 'Listing created successfully!');
        onListingAdded(result.data);
        resetForm();
      } else {
        console.error('❌ Create listing error:', result.error);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('❌ Create listing exception:', error);
      Alert.alert('Error', 'Failed to create listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={addListingModalStyles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={addListingModalStyles.modalContent}>
          {/* Header */}
          <View style={addListingModalStyles.modalHeader}>
            <TouchableOpacity onPress={handleClose} style={addListingModalStyles.closeButton}>
              <Text style={addListingModalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={addListingModalStyles.modalTitle}>Add Listing</Text>
            <View style={{ width: 30 }} />
          </View>

          {/* Form */}
          <ScrollView style={addListingModalStyles.scrollContainer} showsVerticalScrollIndicator={false}>
            <View style={addListingModalStyles.form}>
              <View style={addListingModalStyles.inputContainer}>
                <Text style={addListingModalStyles.label}>Title *</Text>
                <TextInput
                  style={addListingModalStyles.input}
                  placeholder="Enter listing title"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <Text style={addListingModalStyles.label}>Description *</Text>
                <TextInput
                  style={[addListingModalStyles.input, addListingModalStyles.descriptionInput]}
                  placeholder="Describe your item..."
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  maxLength={500}
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <Text style={addListingModalStyles.label}>Price *</Text>
                <TextInput
                  style={addListingModalStyles.input}
                  placeholder="0.00"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <Text style={addListingModalStyles.label}>Category *</Text>
                <TextInput
                  style={addListingModalStyles.input}
                  placeholder="e.g., Books, Electronics, Furniture"
                  value={category}
                  onChangeText={setCategory}
                  maxLength={50}
                />
              </View>

              <View style={addListingModalStyles.imageSection}>
                <Text style={addListingModalStyles.label}>Photo (Optional)</Text>
                
                {selectedImage ? (
                  <View style={addListingModalStyles.imageContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={addListingModalStyles.imagePreview} />
                    <TouchableOpacity 
                      style={addListingModalStyles.changeImageButton} 
                      onPress={pickImage}
                      activeOpacity={0.7}
                    >
                      <Text style={addListingModalStyles.changeImageButtonText}>Change Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={addListingModalStyles.removeImageButton} onPress={removeImage}>
                      <Text style={addListingModalStyles.removeImageButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={addListingModalStyles.imageContainer} 
                    onPress={pickImage}
                    activeOpacity={0.7}
                  >
                    <View style={addListingModalStyles.imagePlaceholder}>
                      <Text style={addListingModalStyles.imagePlaceholderText}>📷 Add Photo{'\n'}Tap to select from gallery or camera</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={addListingModalStyles.buttonContainer}>
              <TouchableOpacity
                style={addListingModalStyles.cancelButton}
                onPress={handleClose}
              >
                <Text style={addListingModalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  addListingModalStyles.submitButton,
                  isLoading && addListingModalStyles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={[
                  addListingModalStyles.submitButtonText,
                  isLoading && addListingModalStyles.submitButtonTextDisabled
                ]}>
                  {isLoading ? 'Creating...' : 'Create Listing'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddListingModal;