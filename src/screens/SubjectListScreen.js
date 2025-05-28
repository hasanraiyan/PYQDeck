// src/screens/SubjectListScreen.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StyleSheet, FlatList, SafeAreaView, Platform, StatusBar, View } from 'react-native';
import { COLORS } from '../constants';
import { findData, loadCompletionStatuses } from '../helpers/helpers';
import ListItemCard from '../components/ListItemCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';

const SubjectListScreen = ({ route, navigation }) => {
    const { branchId, semId } = route.params;
    const { semester: semesterData, error: dataError } = useMemo(
        () => findData({ branchId, semId }),
        [branchId, semId]
    );
    const [error, setError] = useState(dataError);
    const [completionStatuses, setCompletionStatuses] = useState({});
    const [isLoadingStatuses, setIsLoadingStatuses] = useState(true);

    useEffect(() => {
        if (semesterData) {
            navigation.setOptions({
                title: `Sem ${semesterData.number || '?'} Subjects`,
            });
            setError(null);
        } else if (dataError) {
            setError(dataError);
        } else if (!semesterData && !dataError) {
            setError('Semester data could not be loaded.');
        }
    }, [semesterData, dataError, navigation]);

    useEffect(() => {
        let isMounted = true;
        if (semesterData?.subjects && semesterData.subjects.length > 0) {
            setIsLoadingStatuses(true);
            const allQuestionIds = semesterData.subjects.flatMap(
                (sub) => sub.questions?.map((q) => q.questionId) ?? []
            );

            if (allQuestionIds.length > 0) {
                loadCompletionStatuses(allQuestionIds)
                    .then((statuses) => {
                        if (isMounted) {
                            setCompletionStatuses(statuses);
                            setIsLoadingStatuses(false);
                        }
                    })
                    .catch((err) => {
                        console.error('Error loading subject completion statuses:', err);
                        if (isMounted) setIsLoadingStatuses(false);
                    });
            } else {
                if (isMounted) {
                    setCompletionStatuses({});
                    setIsLoadingStatuses(false);
                }
            }
        } else {
            if (isMounted) {
                setCompletionStatuses({});
                setIsLoadingStatuses(false);
            }
        }
        return () => {
            isMounted = false;
        };
    }, [semesterData]);

    const handlePressSubject = useCallback(
        (subjectId) => {
            navigation.navigate('OrganizationSelection', {
                branchId,
                semId,
                subjectId,
            });
        },
        [navigation, branchId, semId]
    );

    const renderSubjectItem = useCallback(
        ({ item }) => {
            const questions = item.questions || [];
            const totalQuestions = questions.length;
            const hasData = totalQuestions > 0;
            let progress = 0;

            if (hasData && !isLoadingStatuses) {
                const completedCount = questions.filter(
                    (q) => completionStatuses[q.questionId]
                ).length;
                progress =
                    totalQuestions > 0 ? (completedCount / totalQuestions) * 100 : 0;
            }

            return (
                <ListItemCard
                    title={item.name}
                    subtitle={item.code || ''}
                    onPress={() => handlePressSubject(item.id)}
                    hasData={hasData}
                    disabled={!hasData}
                    iconName="book-outline"
                    iconSet="Ionicons"
                    iconColor={COLORS.subjectIconColor}
                    progress={hasData ? progress : null}
                />
            );
        },
        [handlePressSubject, completionStatuses, isLoadingStatuses]
    );

    if (error) return <ErrorMessage message={error} />;
    if ((!semesterData && !error) || isLoadingStatuses) return <LoadingIndicator />;
    if (!semesterData?.subjects || semesterData.subjects.length === 0) {
        return <EmptyState message="No subjects found for this semester." />;
    }

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                barStyle="dark-content"
                backgroundColor={COLORS.surface}
            />
            <FlatList
                data={semesterData.subjects}
                renderItem={renderSubjectItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                extraData={completionStatuses}
            />            
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    listContentContainer: {
        paddingTop: 10,
        paddingBottom: Platform.OS === 'ios'
            ? 40
            : 30,
        paddingHorizontal: 12,
    },
    adBannerContainer: {
        alignItems: 'center',
        // The BannerAd with ANCHORED_ADAPTIVE_BANNER will determine its own height.
    },
});

export default SubjectListScreen;