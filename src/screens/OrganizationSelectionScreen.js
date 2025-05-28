
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar, ScrollView } from 'react-native';
import { COLORS } from '../constants';
import {
    findData,
    getUniqueYears,
    getUniqueChapters,
    saveLastJourney,
} from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const OrganizationSelectionScreen = ({ route, navigation }) => {
    const { branchId, semId, subjectId } = route.params;
    const {
        branch,
        semester,
        subject: subjectData,
        questions,
        error: dataError,
    } = useMemo(
        () => findData({ branchId, semId, subjectId }),
        [branchId, semId, subjectId]
    );

    const [error, setError] = useState(dataError);


    useEffect(() => {
        if (subjectData) {
            navigation.setOptions({

                title: `${subjectData.code ? subjectData.code + ' - ' : ''}${subjectData.name || 'Organize Questions'
                    }`,
            });
            setError(null);
        } else if (dataError) {
            setError(dataError);
        } else if (!subjectData && !dataError && !branch && !semester) {

            setError('Subject data could not be loaded.');
        }
    }, [subjectData, branch, semester, dataError, navigation]);


    useEffect(() => {

        if (branch && semester && subjectData) {
            const journeyData = {
                branchId: branch.id,
                semId: semester.id,
                subjectId: subjectData.id,

                branchName: branch.name || 'Unknown Branch',
                semesterName: `Semester ${semester.number || '?'}`,
                subjectName: subjectData.name || 'Unknown Subject',
            };

            saveLastJourney(journeyData);

        }
    }, [branch, semester, subjectData]);


    const navigateToQuestionsAll = useCallback(() => {
        navigation.navigate('Questions', {
            branchId,
            semId,
            subjectId,
            organizationMode: 'all',
        });
    }, [navigation, branchId, semId, subjectId]);

    const navigateToChapterSelection = useCallback(() => {
        navigation.navigate('ChapterSelection', { branchId, semId, subjectId });
    }, [navigation, branchId, semId, subjectId]);

    const navigateToYearSelection = useCallback(() => {
        navigation.navigate('YearSelection', { branchId, semId, subjectId });
    }, [navigation, branchId, semId, subjectId]);




    if (error) return <ErrorMessage message={error} />;


    if (!branch || !semester || !subjectData) {

        if (dataError) {
            return <ErrorMessage message={dataError} />;
        }
        return <LoadingIndicator />;
    }



    const hasQuestions = Array.isArray(questions) && questions.length > 0;
    const uniqueYears = hasQuestions ? getUniqueYears(questions) : [];
    const uniqueChapters = hasQuestions ? getUniqueChapters(questions) : [];
    const canViewByYear = hasQuestions && uniqueYears.length > 0;
    const canViewByChapter = hasQuestions && uniqueChapters.length > 0;

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
            />
            {/* Wrap content in ScrollView if it might overflow, especially with the ad */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.listContentContainer}>
                    { }
                    <ListItemCard
                        title="View All Questions"
                        subtitle={hasQuestions ? "See all questions, newest first" : "No questions available"}
                        onPress={navigateToQuestionsAll}
                        iconName="list-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.primaryLight}
                        hasData={hasQuestions}
                        disabled={!hasQuestions}
                    />
                    { }
                    <ListItemCard
                        title="View By Chapter"
                        subtitle={canViewByChapter ? "Select a chapter to view its questions" : "No chapters found"}
                        onPress={navigateToChapterSelection}
                        iconName="folder-open-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.secondary}
                        hasData={canViewByChapter}
                        disabled={!canViewByChapter}
                    />
                    { }
                    <ListItemCard
                        title="View By Year"
                        subtitle={canViewByYear ? "Filter questions by specific year" : "No years assigned to questions"}
                        onPress={navigateToYearSelection}
                        iconName="calendar-number-outline"
                        iconSet="Ionicons"
                        iconColor={COLORS.yearIconColor}
                        hasData={canViewByYear}
                        disabled={!canViewByYear}
                    />
                    { }
                    {!hasQuestions && (
                        <View style={{ marginTop: 20 }}>
                            <EmptyState message="No questions available for this subject yet." />
                        </View>
                    )}
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
    scrollContainer: {
        flexGrow: 1, // Ensures ScrollView takes up available space if content is short
    },
    listContentContainer: {
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios'
            ? 40
            : 30,
        paddingHorizontal: 12,
    },
    adBannerContainer: {
        alignItems: 'center',
    },
});

export default OrganizationSelectionScreen;