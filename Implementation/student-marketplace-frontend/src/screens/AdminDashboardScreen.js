import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { adminAPI, authAPI } from '../services/api';
import { dashboardStyles } from '../styles/DashboardStyles';
import { colors, spacing, typography, borderRadius, commonStyles } from '../styles/CommonStyles';

const AdminDashboardScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isReportDetailVisible, setIsReportDetailVisible] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentView, setCurrentView] = useState('reports'); // 'reports' or 'users'
  const [usersWithReports, setUsersWithReports] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailVisible, setIsUserDetailVisible] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load both reports and stats
      const [reportsResult, statsResult] = await Promise.all([
        adminAPI.getAllReports(statusFilter),
        adminAPI.getDashboardStats()
      ]);

      if (reportsResult.success) {
        setReports(reportsResult.data.data || []);
      } else {
        Alert.alert('Error', reportsResult.error);
      }

      if (statsResult.success) {
        setDashboardStats(statsResult.data.data || {});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await authAPI.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  const handleMenuPress = () => {
    setIsMenuVisible(!isMenuVisible);
  };

  const handleUserManagement = async () => {
    setIsMenuVisible(false);
    setCurrentView('users');
    
    try {
      setIsLoadingUsers(true);
      const result = await adminAPI.getUsersWithReports();
      if (result.success) {
        setUsersWithReports(result.data.data || []);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load users with reports');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleBackToReports = () => {
    setCurrentView('reports');
    setUsersWithReports([]);
    setSelectedUser(null);
    setIsUserDetailVisible(false);
    setIsLoadingUsers(false);
  };

  const handleUserModeration = async (action, duration, reason) => {
    if (!selectedUser) return;

    try {
      const result = await adminAPI.moderateUser(selectedUser._id, action, duration, reason);
      
      if (result.success) {
        const actionName = action === 'activate' 
          ? (selectedUser.isSuspended ? 'unsuspended' : 'unbanned')
          : action + 'ed';
        Alert.alert('Success', `User ${actionName} successfully`);
        setIsUserDetailVisible(false);
        setSelectedUser(null);
        
        // Refresh user list
        const usersResult = await adminAPI.getUsersWithReports();
        if (usersResult.success) {
          setUsersWithReports(usersResult.data.data || []);
        }
        
        // Refresh dashboard stats
        const statsResult = await adminAPI.getDashboardStats();
        if (statsResult.success) {
          setDashboardStats(statsResult.data.data || {});
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to moderate user');
    }
  };

  const handleCloseUserDetail = () => {
    setIsUserDetailVisible(false);
    setSelectedUser(null);
  };

  const handleStatusFilter = async (status) => {
    console.log('🔍 Filtering reports by status:', status);
    setStatusFilter(status);
    setIsMenuVisible(false);
    setIsRefreshing(true);
    
    try {
      const reportsResult = await adminAPI.getAllReports(status);
      console.log('📊 Reports result:', reportsResult);
      
      if (reportsResult.success) {
        const reportData = reportsResult.data.data || [];
        console.log(`✅ Found ${reportData.length} reports with status: ${status}`);
        setReports(reportData);
      } else {
        console.error('❌ Error fetching reports:', reportsResult.error);
        Alert.alert('Error', reportsResult.error);
      }
    } catch (error) {
      console.error('❌ Exception while fetching reports:', error);
      Alert.alert('Error', 'Failed to load reports');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReportPress = (report) => {
    setSelectedReport(report);
    setIsReportDetailVisible(true);
  };

  const handleReportAction = async (action, notes = '') => {
    if (!selectedReport) return;

    console.log(`🎯 Taking action on report: ${action} for report ${selectedReport._id}`);

    try {
      const result = await adminAPI.updateReport(
        selectedReport._id,
        action === 'dismiss' ? 'dismissed' : 'resolved',
        action === 'delete_listing' ? 'listing_removed' : 'none',
        notes
      );

      console.log('📝 Update report result:', result);

      if (result.success) {
        Alert.alert('Success', 'Report updated successfully');
        setIsReportDetailVisible(false);
        setSelectedReport(null);
        
        console.log(`🔄 Refreshing reports with current filter: ${statusFilter}`);
        
        // Refresh reports with current filter to show updated data
        const reportsResult = await adminAPI.getAllReports(statusFilter);
        if (reportsResult.success) {
          const reportData = reportsResult.data.data || [];
          console.log(`✅ Refreshed ${reportData.length} reports`);
          setReports(reportData);
        }
        
        // Refresh dashboard stats
        const statsResult = await adminAPI.getDashboardStats();
        if (statsResult.success) {
          setDashboardStats(statsResult.data.data || {});
        }
      } else {
        console.error('❌ Error updating report:', result.error);
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      console.error('❌ Exception while updating report:', error);
      Alert.alert('Error', 'Failed to update report');
    }
  };

  const handleDeleteListing = async () => {
    if (!selectedReport?.listing?._id) return;

    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await adminAPI.deleteListing(
                selectedReport.listing._id,
                'Removed due to report violation'
              );

              if (result.success) {
                Alert.alert('Success', 'Listing deleted successfully');
                handleReportAction('delete_listing', 'Listing removed due to violation');
              } else {
                Alert.alert('Error', result.error);
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete listing');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f39c12';
      case 'reviewed': return '#3498db';
      case 'resolved': return '#27ae60';
      case 'dismissed': return '#95a5a6';
      default: return '#7f8c8d';
    }
  };

  const renderReportCard = (report) => {
    return (
      <TouchableOpacity 
        key={report._id} 
        style={[dashboardStyles.listingCard, { borderLeftWidth: 4, borderLeftColor: getStatusColor(report.status) }]}
        onPress={() => handleReportPress(report)}
        activeOpacity={0.8}
      >
        <View style={dashboardStyles.cardContent}>
          {/* Report Header */}
          <View style={styles.reportHeader}>
            <Text style={styles.reportId}>Report #{report._id.slice(-6)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(report.status) }]}>
              <Text style={styles.statusText}>{report.status.toUpperCase()}</Text>
            </View>
          </View>

          {/* Listing Info */}
          <Text style={dashboardStyles.listingTitle}>
            📋 {report.listing?.title || 'Listing Deleted'}
          </Text>
          
          {/* Report Details */}
          <Text style={styles.reportReason}>
            🚨 Reason: {report.reason?.replace('_', ' ').toUpperCase()}
          </Text>
          
          <Text style={styles.reportedUser}>
            👤 Reported User: {report.reportedUser?.name || 'Unknown'}
          </Text>

          <Text style={styles.reportDate}>
            📅 Reported: {formatDate(report.createdAt)}
          </Text>

          {report.description && (
            <Text style={styles.reportDescription} numberOfLines={2}>
              💬 "{report.description}"
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const StatsCard = ({ title, value, color }) => (
    <View style={[styles.statsCard, { borderTopColor: color }]}>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  return (
    <SafeAreaView style={dashboardStyles.container}>
      {/* Header */}
      <View style={dashboardStyles.header}>
        <TouchableOpacity onPress={handleMenuPress} style={dashboardStyles.menuButton}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={dashboardStyles.headerTitle}>🛡️ Admin Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid - 2x2 Layout */}
      <View style={styles.statsGrid}>
        <View style={styles.statsRow}>
          <StatsCard title="Total Reports" value={dashboardStats.totalReports || 0} color="#e74c3c" />
          <StatsCard title="Pending" value={dashboardStats.pendingReports || 0} color="#f39c12" />
        </View>
        <View style={styles.statsRow}>
          <StatsCard title="Total Users" value={dashboardStats.totalUsers || 0} color="#3498db" />
          <StatsCard title="Suspended" value={dashboardStats.suspendedUsers || 0} color="#e67e22" />
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity 
          style={[styles.toggleButton, currentView === 'reports' && styles.activeToggle]}
          onPress={() => setCurrentView('reports')}
        >
          <Text style={[styles.toggleText, currentView === 'reports' && styles.activeToggleText]}>
            📋 Reports
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, currentView === 'users' && styles.activeToggle]}
          onPress={handleUserManagement}
        >
          <Text style={[styles.toggleText, currentView === 'users' && styles.activeToggleText]}>
            👥 User Management
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      {currentView === 'reports' ? (
        /* Reports List */
        <FlatList
          data={reports}
          renderItem={({ item }) => renderReportCard(item)}
          keyExtractor={(item) => item._id}
          contentContainerStyle={reports.length === 0 ? dashboardStyles.scrollContainer : null}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={8}
          windowSize={5}
          ListEmptyComponent={() => (
            <View style={dashboardStyles.emptyContainer}>
              {isLoading ? (
                <Text style={dashboardStyles.emptyText}>Loading reports...</Text>
              ) : (
                <>
                  <Text style={dashboardStyles.emptyText}>No reports found</Text>
                  <Text style={dashboardStyles.emptySubtext}>No reports to review at this time</Text>
                </>
              )}
            </View>
          )}
        />
      ) : (
        /* Users List */
        isLoadingUsers ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.emptyText}>Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={usersWithReports}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ padding: 20 }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.userCard}
                onPress={() => {
                  setSelectedUser(item);
                  setIsUserDetailVisible(true);
                }}
              >
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.name}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                  <Text style={styles.userCampus}>📍 {item.campus}</Text>
                </View>
                
                <View style={styles.userStatus}>
                  <View style={[styles.reportBadge, { backgroundColor: item.reportCount > 3 ? '#e74c3c' : '#f39c12' }]}>
                    <Text style={styles.reportCount}>{item.reportCount} reports</Text>
                  </View>
                  
                  {item.isSuspended && (
                    <View style={[styles.statusBadge, { backgroundColor: '#e67e22' }]}>
                      <Text style={styles.statusText}>SUSPENDED</Text>
                    </View>
                  )}
                  
                  {!item.isActive && (
                    <View style={[styles.statusBadge, { backgroundColor: '#e74c3c' }]}>
                      <Text style={styles.statusText}>BANNED</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users with reports found</Text>
                <Text style={styles.emptySubtext}>All users are behaving well! 🎉</Text>
              </View>
            )}
          />
        )
      )}

      {/* Filter Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={dashboardStyles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={dashboardStyles.modalContent}>
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={() => handleStatusFilter('all')}
            >
              <Text style={dashboardStyles.modalItemText}>📋 All Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={() => handleStatusFilter('pending')}
            >
              <Text style={dashboardStyles.modalItemText}>⏳ Pending Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[dashboardStyles.modalItem, { borderBottomWidth: 1, borderBottomColor: '#ecf0f1' }]} 
              onPress={() => handleStatusFilter('resolved')}
            >
              <Text style={dashboardStyles.modalItemText}>✅ Resolved Reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={dashboardStyles.modalItem} 
              onPress={() => handleStatusFilter('dismissed')}
            >
              <Text style={dashboardStyles.modalItemText}>❌ Dismissed Reports</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Detail Modal */}
      <Modal
        visible={isReportDetailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsReportDetailVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsReportDetailVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Report Details</Text>
            <View style={{ width: 30 }} />
          </View>

          {selectedReport && (
            <ScrollView style={styles.reportDetailContainer}>
              {/* Report Info */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Report Information</Text>
                <Text style={styles.detailText}>ID: {selectedReport._id}</Text>
                <Text style={styles.detailText}>Status: {selectedReport.status}</Text>
                <Text style={styles.detailText}>Reason: {selectedReport.reason}</Text>
                <Text style={styles.detailText}>Date: {formatDate(selectedReport.createdAt)}</Text>
                {selectedReport.description && (
                  <Text style={styles.detailText}>Description: "{selectedReport.description}"</Text>
                )}
              </View>

              {/* Listing Info */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Reported Listing</Text>
                <Text style={styles.detailText}>Title: {selectedReport.listing?.title || 'Deleted'}</Text>
                <Text style={styles.detailText}>Category: {selectedReport.listing?.category || 'N/A'}</Text>
                <Text style={styles.detailText}>Price: ${selectedReport.listing?.price || 'N/A'}</Text>
                
                {/* Listing Description */}
                {selectedReport.listing?.description && (
                  <View style={styles.descriptionContainer}>
                    <Text style={styles.descriptionLabel}>Description:</Text>
                    <Text style={styles.descriptionText}>{selectedReport.listing.description}</Text>
                  </View>
                )}
                
                {/* Listing Photo */}
                {(selectedReport.listing?.imageUrl || selectedReport.listing?.photo) && (
                  <View style={styles.imageContainer}>
                    <Text style={styles.descriptionLabel}>Listing Photo:</Text>
                    <Image 
                      source={{ uri: selectedReport.listing.imageUrl || selectedReport.listing.photo }} 
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>

              {/* User Info */}
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Reported User</Text>
                <Text style={styles.detailText}>Name: {selectedReport.reportedUser?.name || 'Unknown'}</Text>
                <Text style={styles.detailText}>Email: {selectedReport.reportedUser?.email || 'Unknown'}</Text>
                <Text style={styles.detailText}>Campus: {selectedReport.reportedUser?.campus || 'Unknown'}</Text>
              </View>

              {/* Action Buttons */}
              {selectedReport.status === 'pending' && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
                    onPress={handleDeleteListing}
                  >
                    <Text style={styles.actionButtonText}>🗑️ Delete Listing</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, { backgroundColor: '#95a5a6' }]}
                    onPress={() => handleReportAction('dismiss')}
                  >
                    <Text style={styles.actionButtonText}>❌ Dismiss Report</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* User Detail Modal */}
      <Modal
        visible={isUserDetailVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseUserDetail}
      >
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseUserDetail} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>User Actions</Text>
              <View style={{ width: 30 }} />
            </View>

            {selectedUser && (
              <ScrollView style={styles.reportDetailContainer}>
                {/* User Info */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>User Information</Text>
                  <Text style={styles.detailText}>Name: {selectedUser.name}</Text>
                  <Text style={styles.detailText}>Email: {selectedUser.email}</Text>
                  <Text style={styles.detailText}>Campus: {selectedUser.campus}</Text>
                  <Text style={styles.detailText}>Report Count: {selectedUser.reportCount}</Text>
                  <Text style={styles.detailText}>Member Since: {formatDate(selectedUser.createdAt)}</Text>
                  
                  {selectedUser.isSuspended && (
                    <>
                      <Text style={[styles.detailText, { color: '#e74c3c', fontWeight: 'bold' }]}>
                        Status: SUSPENDED
                      </Text>
                      {selectedUser.suspendedUntil && (
                        <Text style={styles.detailText}>
                          Suspended Until: {formatDate(selectedUser.suspendedUntil)}
                        </Text>
                      )}
                      {selectedUser.suspensionReason && (
                        <Text style={styles.detailText}>
                          Reason: {selectedUser.suspensionReason}
                        </Text>
                      )}
                    </>
                  )}
                </View>

                {/* Moderation Actions */}
                <View style={styles.detailSection}>
                  <Text style={styles.sectionTitle}>Moderation Actions</Text>
                  
                  {/* Show unsuspend/unban options for suspended or banned users */}
                  {selectedUser.isSuspended || !selectedUser.isActive ? (
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#27ae60' }]}
                      onPress={() => handleUserModeration('activate', null, selectedUser.isSuspended ? 'Suspension lifted by admin' : 'Ban lifted by admin')}
                    >
                      <Text style={styles.actionButtonText}>
                        ✅ {selectedUser.isSuspended ? 'Unsuspend User' : 'Unban User'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    /* Show moderation options for active users */
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#f39c12' }]}
                        onPress={() => handleUserModeration('suspend', 7, 'Suspended for 7 days due to multiple reports')}
                      >
                        <Text style={styles.actionButtonText}>⏸️ Suspend 7 Days</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#e67e22' }]}
                        onPress={() => handleUserModeration('suspend', 30, 'Suspended for 30 days due to repeated violations')}
                      >
                        <Text style={styles.actionButtonText}>⏸️ Suspend 30 Days</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, { backgroundColor: '#e74c3c' }]}
                        onPress={() => handleUserModeration('ban', null, 'Permanently banned due to severe violations')}
                      >
                        <Text style={styles.actionButtonText}>🚫 Permanent Ban</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </ScrollView>
            )}
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = {
  menuIcon: {
    fontSize: typography.xxl,
    color: colors.white,
    fontWeight: typography.bold,
  },
  logoutButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.xl,
  },
  logoutButtonText: {
    color: colors.white,
    fontWeight: typography.semiBold,
  },
  statsGrid: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
    color: colors.textSecondary,
  },
  activeToggleText: {
    color: colors.white,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flex: 0.48,
    alignItems: 'center',
    borderTopWidth: 3,
    ...commonStyles.shadow,
  },
  statsValue: {
    fontSize: typography.xxl,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  statsTitle: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reportId: {
    fontSize: typography.xs,
    color: colors.textSecondary,
    fontWeight: typography.semiBold,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  reportReason: {
    fontSize: typography.sm,
    color: colors.danger,
    marginBottom: spacing.xs,
    fontWeight: typography.semiBold,
  },
  reportedUser: {
    fontSize: typography.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  reportDate: {
    fontSize: typography.xs,
    color: colors.textTertiary,
    marginBottom: spacing.xs,
  },
  reportDescription: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: typography.lg,
    color: colors.textSecondary,
    fontWeight: typography.bold,
  },
  reportDetailContainer: {
    flex: 1,
    padding: spacing.xl,
  },
  detailSection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...commonStyles.shadow,
  },
  sectionTitle: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundTertiary,
    paddingBottom: spacing.xs,
  },
  detailText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  actionButtons: {
    marginTop: spacing.xl,
  },
  actionButton: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: typography.md,
    fontWeight: typography.bold,
  },
  // User Management Styles
  userCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  userInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  userName: {
    fontSize: typography.md,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  userCampus: {
    fontSize: typography.xs,
    color: colors.textTertiary,
  },
  userStatus: {
    alignItems: 'flex-end',
  },
  reportBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xs,
  },
  reportCount: {
    color: colors.white,
    fontSize: typography.xs,
    fontWeight: typography.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.huge,
  },
  emptyText: {
    fontSize: typography.lg,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: typography.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  descriptionContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  descriptionLabel: {
    fontSize: typography.sm,
    fontWeight: typography.semiBold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontSize: typography.sm,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  imageContainer: {
    marginTop: spacing.md,
  },
  listingImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundTertiary,
  },
};

export default AdminDashboardScreen;