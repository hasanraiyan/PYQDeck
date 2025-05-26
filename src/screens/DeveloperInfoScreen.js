import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    ScrollView,
    Image,
    Linking,
    TouchableOpacity,
    Platform,
    StatusBar,
} from 'react-native';
import { COLORS } from '../constants';
import Icon from '../components/Icon';
import ListItemCard from '../components/ListItemCard';

const DeveloperInfoScreen = () => {
    const appVersion = '3.0.2';

    const handleEmailPress = () => {
        Linking.openURL('mailto:raiyanhasan2006@gmail.com');
    };

    const handleWebsitePress = () => {
        Linking.openURL('https://pyqdeck.vercel.app');
    };

    const handleGithubPress = () => {
        Linking.openURL('https://github.com/hasanraiyan');
    };

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
            />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.headerContainer}>
                    <View style={styles.logoContainer}>
                        <Icon
                            iconSet="Ionicons"
                            name="school"
                            size={60}
                            color={COLORS.primary}
                        />
                    </View>
                    <Text style={styles.appTitle}>PYQDeck</Text>
                    <Text style={styles.appSubtitle}>Your Pocket Guide to BEU Past Year Questions</Text>
                    <Text style={styles.versionText}>Version {appVersion}</Text>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About the App</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardText}>
                            PYQDeck helps students of Bihar Engineering University access and organize past year questions (PYQs) for their academic courses. The app allows users to browse questions by branch, semester, subject, chapter, and year.
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Developer</Text>
                    <View style={styles.developerCard}>
                        <View style={styles.developerHeader}>
                            <View style={styles.avatarContainer}>
                                <Icon
                                    iconSet="Ionicons"
                                    name="person-circle-outline"
                                    size={50}
                                    color={COLORS.primaryLight}
                                />
                            </View>
                            <View style={styles.developerInfo}>
                                <Text style={styles.developerName}>Raiyan Hasan</Text>
                                <Text style={styles.developerRole}>Lead Developer</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />
                        <Text style={styles.bioText}>
                            Passionate about creating educational tools that make learning more accessible and efficient for students.
                        </Text>
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Contact</Text>
                    <ListItemCard
                        title="Email"
                        subtitle="raiyanhasan2006@gmail.com"
                        onPress={handleEmailPress}
                        iconName="mail-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.primary}
                    />
                    <ListItemCard
                        title="Website"
                        subtitle="https://hasanraiyan.github.io/Portfolio"
                        onPress={handleWebsitePress}
                        iconName="globe-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.secondary}
                    />
                    <ListItemCard
                        title="GitHub"
                        subtitle="https://github.com/hasanraiyan"
                        onPress={handleGithubPress}
                        iconName="logo-github"
                        iconSet="Ionicons"
                        iconColor={COLORS.textSecondary}
                    />
                </View>

                <View style={styles.footerContainer}>
                    <Text style={styles.copyrightText}>© {new Date().getFullYear()} PYQDeck</Text>
                    <Text style={styles.footerText}>All Rights Reserved</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: COLORS.surface,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.border,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(67, 56, 202, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    appTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    appSubtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    versionText: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    sectionContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    cardText: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.text,
    },
    developerCard: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.18,
        shadowRadius: 1.0,
        elevation: 1,
    },
    developerHeader: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    developerInfo: {
        flex: 1,
    },
    developerName: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: 4,
    },
    developerRole: {
        fontSize: 14,
        color: COLORS.textSecondary,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: COLORS.border,
        marginHorizontal: 16,
    },
    bioText: {
        fontSize: 15,
        lineHeight: 22,
        color: COLORS.text,
        padding: 16,
        paddingTop: 12,
    },
    footerContainer: {
        marginTop: 30,
        alignItems: 'center',
        paddingBottom: 20,
    },
    copyrightText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    footerText: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
});

export default DeveloperInfoScreen;