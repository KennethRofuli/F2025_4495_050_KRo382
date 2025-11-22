import React, { useState, useEffect } from 'react';
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

const EditListingModal = ({ visible, onClose, listing, onListingUpdated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Populate form when listing changes
  useEffect(() => {
    if (listing) {
      setTitle(listing.title || '');
      setDescription(listing.description || '');
      setPrice(listing.price ? listing.price.toString() : '');
      setCategory(listing.category || '');
      // Set existing image if available
      if (listing.photo) {
        setSelectedImage({ uri: listing.photo, isExisting: true });
      } else {
        setSelectedImage(null);
      }
    }
  }, [listing]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPrice('');
    setCategory('');
    setSelectedImage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
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
  };

  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  const openImageLibrary = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open image library');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
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
      };

      // Handle image update
      if (selectedImage && !selectedImage.isExisting) {
        // New image selected
        listingData.photo = `data:image/jpeg;base64,${selectedImage.base64}`;
      } else if (!selectedImage) {
        // Image removed
        listingData.photo = null;
      }
      // If selectedImage.isExisting is true, don't update photo field

      console.log('📝 Updating listing:', listing._id, {
        ...listingData,
        photo: listingData.photo ? `Image updated (${listingData.photo.length} chars)` : listingData.photo
      });

      const result = await listingsAPI.updateListing(listing._id, listingData);
      
      if (result.success) {
        Alert.alert('Success', 'Listing updated successfully!');
        onListingUpdated(result.data);
        resetForm();
      } else {
        console.error('❌ Update listing error:', result.error);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('❌ Update listing exception:', error);
      Alert.alert('Error', 'Failed to update listing. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!listing) return null;

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
            <Text style={addListingModalStyles.modalTitle}>Edit Listing</Text>
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

              <View style={addListingModalStyles.imageSection}>
                <Text style={addListingModalStyles.label}>Photo (Optional)</Text>
                
                {selectedImage ? (
                  <View style={addListingModalStyles.imageContainer}>
                    <Image source={{ uri: selectedImage.uri }} style={addListingModalStyles.imagePreview} />
                    <TouchableOpacity style={addListingModalStyles.changeImageButton} onPress={pickImage}>
                      <Text style={addListingModalStyles.changeImageButtonText}>Change Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={addListingModalStyles.removeImageButton} onPress={removeImage}>
                      <Text style={addListingModalStyles.removeImageButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity style={addListingModalStyles.imageContainer} onPress={pickImage}>
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
                Update Listing
              </Button>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EditListingModal;