import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { TextInput as PaperTextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { listingsAPI } from '../services/api';
import { addListingModalStyles } from '../styles/AddListingModalStyles';
import AIPriceSuggestion from './AIPriceSuggestion';

const AddListingModal = ({ visible, onClose, onListingAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cloudinary configuration
  const CLOUDINARY_CLOUD_NAME = 'dyxsxxxhc'; // Your cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'student-marketplace'; // Your custom preset (make sure it's UNSIGNED!)

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSelectedImage(null);
  };

  // Upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    try {
      console.log('📤 Starting Cloudinary upload...');
      
      const data = new FormData();
      data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'listing.jpg',
      });
      data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: data,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const result = await response.json();
      console.log('📋 Cloudinary response:', result);
      
      if (result.error) {
        console.error('❌ Cloudinary error details:', result.error);
        throw new Error(result.error.message);
      }

      if (!response.ok) {
        console.error('❌ HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error: ${response.status}`);
      }

      console.log('✅ Cloudinary upload successful:', result.secure_url);
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      throw error;
    }
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
      let imageUrl = null;
      let cloudinaryId = null;

      // Upload image to Cloudinary if selected
      if (selectedImage) {
        console.log('📤 Uploading image to Cloudinary...');
        const uploadResult = await uploadToCloudinary(selectedImage.uri);
        imageUrl = uploadResult.url;
        cloudinaryId = uploadResult.publicId;
        console.log('✅ Image uploaded successfully');
      }

      const listingData = {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        imageUrl: imageUrl, // Send Cloudinary URL instead of base64
        cloudinaryId: cloudinaryId, // For potential deletion later
      };

      console.log('📝 Creating listing:', {
        ...listingData,
        imageUrl: imageUrl ? 'Image URL attached' : 'No image'
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
                <PaperTextInput
                  label="Title *"
                  value={title}
                  onChangeText={setTitle}
                  maxLength={100}
                  mode="outlined"
                  style={{ backgroundColor: '#fff' }}
                  outlineColor="#ddd"
                  activeOutlineColor="#3498db"
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <PaperTextInput
                  label="Description *"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                  mode="outlined"
                  style={{ backgroundColor: '#fff' }}
                  outlineColor="#ddd"
                  activeOutlineColor="#3498db"
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <PaperTextInput
                  label="Price *"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  maxLength={10}
                  mode="outlined"
                  style={{ backgroundColor: '#fff' }}
                  outlineColor="#ddd"
                  activeOutlineColor="#3498db"
                  left={<PaperTextInput.Affix text="$" />}
                />
              </View>

              <View style={addListingModalStyles.inputContainer}>
                <PaperTextInput
                  label="Category *"
                  placeholder="e.g., Books, Electronics, Furniture"
                  value={category}
                  onChangeText={setCategory}
                  maxLength={50}
                  mode="outlined"
                  style={{ backgroundColor: '#fff' }}
                  outlineColor="#ddd"
                  activeOutlineColor="#3498db"
                />
              </View>

              {/* AI Price Suggestion */}
              {title && category && (
                <AIPriceSuggestion
                  title={title}
                  description={description}
                  category={category}
                  condition="Good" // Default condition for now
                  onPriceSelect={setPrice}
                />
              )}

              <View style={addListingModalStyles.imageSection}>
                <Text style={addListingModalStyles.label}>Photo (Optional)</Text>
                
                {selectedImage ? (
                  <View style={addListingModalStyles.imageContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={addListingModalStyles.imagePreview} />
                    <View style={addListingModalStyles.imageButtonsContainer}>
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
              <Button
                mode="outlined"
                onPress={handleClose}
                style={{ borderRadius: 8, flex: 1, marginRight: 8 }}
                contentStyle={{ paddingVertical: 8 }}
                textColor="#666"
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={isLoading}
                disabled={isLoading}
                style={{ borderRadius: 8, flex: 1, marginLeft: 8 }}
                contentStyle={{ paddingVertical: 8 }}
                buttonColor="#3498db"
              >
                Create Listing
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddListingModal;