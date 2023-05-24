// Copyright 2020 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Component for home tab in the Learner Dashboard page.
 */

import { AppConstants } from 'app.constants';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LearnerTopicSummary } from 'domain/topic/learner-topic-summary.model';
import { LearnerDashboardPageConstants } from 'pages/learner-dashboard-page/learner-dashboard-page.constants';
import { UrlInterpolationService } from 'domain/utilities/url-interpolation.service';
import { Subscription } from 'rxjs';
import { WindowDimensionsService } from 'services/contextual/window-dimensions.service';
import { I18nLanguageCodeService } from 'services/i18n-language-code.service';

import './home-tab.component.css';
import { StorySummary } from 'domain/story/story-summary.model';
import { LearnerDashboardBackendApiService } from 'domain/learner_dashboard/learner-dashboard-backend-api.service';
import { CollectionSummary } from 'domain/collection/collection-summary.model';
import { AlertsService } from 'services/alerts.service';
import { LearnerExplorationSummary } from 'domain/summary/learner-exploration-summary.model';
import { LearnerDashboardActivityBackendApiService } from 'domain/learner_dashboard/learner-dashboard-activity-backend-api.service';

interface storySummaryTile {
  topicName: string;
  storySummary: StorySummary;
}

interface ShowMoreInSectionDict {
  [section: string]: boolean;
}

 @Component({
   selector: 'oppia-home-tab',
   templateUrl: './home-tab.component.html',
   styleUrls: ['./home-tab.component.css']
 })
export class HomeTabComponent {
  @Output() setActiveSection: EventEmitter<string> = new EventEmitter();
  // These properties are initialized using Angular lifecycle hooks
  // and we need to do non-null assertion. For more information, see
  // https://github.com/oppia/oppia/wiki/Guide-on-defining-types#ts-7-1
  @Input() currentGoals!: LearnerTopicSummary[];
  @Input() goalTopics!: LearnerTopicSummary[];
  @Input() partiallyLearntTopicsList!: LearnerTopicSummary[];
  @Input() untrackedTopics!: Record<string, LearnerTopicSummary[]>;
  @Input() username!: string;
  communtiyLessonsDataLoaded: boolean = false;
  showMoreInSection: ShowMoreInSectionDict = {
    playlist: false
  };
  startIndexInPlaylist: number = 0;
  pageSize: number = 3;
  endIndexInPlaylist: number = 3;
  pageNumberInPlaylist: number = 1;
  noPlaylistActivity: boolean = false;
  currentGoalsLength!: number;
  classroomUrlFragment!: string;
  goalTopicsLength!: number;
  width!: number;
  CLASSROOM_LINK_URL_TEMPLATE: string = '/learn/<classroom_url_fragment>';
  nextIncompleteNodeTitles: string[] = [];
  widthConst: number = 233;
  continueWhereYouLeftOffList: LearnerTopicSummary[] = [];
  storyInProgress: storySummaryTile[] = [];
  storyInRecommended: storySummaryTile[] = [];
  windowIsNarrow: boolean = false;
  directiveSubscriptions = new Subscription();
  nodeCount!: number;
  completedNodeCount!: number;
  storyProgress!: number;
  topicSummaryTile: LearnerTopicSummary;
  storySummary: StorySummary;
  completedCollectionsList!: CollectionSummary[];
  incompleteCollectionsList!: CollectionSummary[];
  completedToIncompleteCollections!: string[];
  collectionPlaylist!: CollectionSummary[];
  completedExplorationsList!: LearnerExplorationSummary[];
  incompleteExplorationsList!: LearnerExplorationSummary[];
  explorationPlaylist!: LearnerExplorationSummary[];
  totalLessonsInPlaylist: (
    LearnerExplorationSummary | CollectionSummary)[] = [];
  displayLessonsInPlaylist: (
    LearnerExplorationSummary | CollectionSummary)[] = [];

  constructor(
    private alertsService: AlertsService,
    private i18nLanguageCodeService: I18nLanguageCodeService,
    private windowDimensionService: WindowDimensionsService,
    private learnerDashboardActivityBackendApiService:
      LearnerDashboardActivityBackendApiService,
    private learnerDashboardBackendApiService:
      LearnerDashboardBackendApiService,
    private urlInterpolationService: UrlInterpolationService,
  ) {}

  ngOnInit(): void {
    this.width = this.widthConst * (this.currentGoals.length);
    var allGoals = [...this.currentGoals, ...this.partiallyLearntTopicsList];
    this.currentGoalsLength = this.currentGoals.length;
    this.goalTopicsLength = this.goalTopics.length;
    if (allGoals.length !== 0) {
      var allGoalIds = [];
      for (var goal of allGoals) {
        allGoalIds.push(goal.id);
      }
      var uniqueGoalIds = Array.from(new Set(allGoalIds));
      for (var uniqueGoalId of uniqueGoalIds) {
        var index = allGoalIds.indexOf(uniqueGoalId);
        this.continueWhereYouLeftOffList.push(allGoals[index]);
      }
    }

    // setActiveSection(newActiveSectionName: string): void {
      // this.activeSection = newActiveSectionName;
      // if (this.activeSection ===
      //   LearnerDashboardPageConstants
      //     .LEARNER_DASHBOARD_SECTION_I18N_IDS.COMMUNITY_LESSONS) {
        // this.loaderService.showLoadingScreen('Loading');
        let dashboardCollectionsDataPromise = (
          this.learnerDashboardBackendApiService
            .fetchLearnerDashboardCollectionsDataAsync());
        dashboardCollectionsDataPromise.then(
          responseData => {
            console.log(responseData,"bhole");
            this.completedCollectionsList = (
              responseData.completedCollectionsList);
            this.incompleteCollectionsList = (
              responseData.incompleteCollectionsList);
            this.completedToIncompleteCollections = (
              responseData.completedToIncompleteCollections);
            this.collectionPlaylist = responseData.collectionPlaylist;
          }, errorResponseStatus => {
            if (
              AppConstants.FATAL_ERROR_CODES.indexOf(errorResponseStatus
              ) !== -1) {
              this.alertsService.addWarning(
                'Failed to get learner dashboard collections data');
            }
          }
        );
  
        let dashboardExplorationsDataPromise = (
          this.learnerDashboardBackendApiService
            .fetchLearnerDashboardExplorationsDataAsync());
        dashboardExplorationsDataPromise.then(
          responseData => {
            this.completedExplorationsList = (
              responseData.completedExplorationsList);
            this.incompleteExplorationsList = (
              responseData.incompleteExplorationsList);
            // this.subscriptionsList = responseData.subscriptionList;
            this.explorationPlaylist = responseData.explorationPlaylist;
          }, errorResponseStatus => {
            if (
              AppConstants.FATAL_ERROR_CODES.indexOf(errorResponseStatus
              ) !== -1) {
              this.alertsService.addWarning(
                'Failed to get learner dashboard explorations data');
            }
          }
        );
        Promise.all([
          dashboardCollectionsDataPromise,
          dashboardExplorationsDataPromise,
        ]).then(() => {
          setTimeout(() => {
            // this.loaderService.hideLoadingScreen();
            this.communtiyLessonsDataLoaded = true;
            // So that focus is applied after the loading screen has dissapeared.
            // this.focusManagerService.setFocusWithoutScroll('ourLessonsBtn');
          }, 0);
        }).catch(errorResponse => {
          // This is placed here in order to satisfy Unit tests.
        });
      // }
      // if (this.activeSection ===
      //   LearnerDashboardPageConstants
      //     .LEARNER_DASHBOARD_SECTION_I18N_IDS.FEEDBACK &&
      //   this.feedbackThreadActive === true) {
      //   this.feedbackThreadActive = false;
      // }
    // }



    this.totalLessonsInPlaylist.push(
      ...this.explorationPlaylist, ...this.collectionPlaylist);











  for(var topicSummaryTile of this.continueWhereYouLeftOffList) {
    for(var storySummary of topicSummaryTile.canonicalStorySummaryDicts) {
    this.nodeCount = storySummary.getNodeTitles().length;
    this.completedNodeCount = storySummary.getCompletedNodeTitles().length;
    this.storyProgress = Math.floor(
      (this.completedNodeCount / this.nodeCount) * 100);
      if(this.storyProgress !==0) {
        var storyData: storySummaryTile = {
          topicName: topicSummaryTile.name,
          storySummary: storySummary
        }
        this.storyInProgress.push(storyData);
      }

      if(this.storyProgress ===0) {
        console.log(this.storyProgress,"bhole");
        var storyData: storySummaryTile = {
          topicName: topicSummaryTile.name,
          storySummary: storySummary
        }
        this.storyInRecommended.push(storyData);
      }
    }
  }


    
    this.windowIsNarrow = this.windowDimensionService.isWindowNarrow();
    this.directiveSubscriptions.add(
      this.windowDimensionService.getResizeEvent().subscribe(() => {
        this.windowIsNarrow = this.windowDimensionService.isWindowNarrow();
      }));
  }


  handleShowMore(): void {
  // this.showMoreInSection[section] = !this.showMoreInSection[section];
    // if (
    //   section === 'incomplete' && this.showMoreInSection.incomplete === true) {
    //   this.displayIncompleteLessonsList = this.totalIncompleteLessonsList;
    // } 
    // else if (
    //   section === 'incomplete' && this.showMoreInSection.incomplete === false) {
    //   this.displayIncompleteLessonsList = this.totalIncompleteLessonsList.slice(
    //     0, 3);
    // } 
    // else if (
    //   section === 'completed' && this.showMoreInSection.completed === true) {
    //   this.displayCompletedLessonsList = this.totalCompletedLessonsList;
    // } 
    // else if (
    //   section === 'completed' && this.showMoreInSection.completed === false) {
    //   this.displayCompletedLessonsList = this.totalCompletedLessonsList.slice(
    //     0, 3);
    // }
    if 
    //  (section === 'playlist' && this.showMoreInSection.playlist === true)
     (this.showMoreInSection.playlist === true) {
      this.displayLessonsInPlaylist = this.totalLessonsInPlaylist;
      this.startIndexInPlaylist = 0;
      this.endIndexInPlaylist = this.totalLessonsInPlaylist.length;
    } else if 
    // (section === 'playlist' && this.showMoreInSection.playlist === false)
      (this.showMoreInSection.playlist === false) {
      this.startIndexInPlaylist = 0;
      this.endIndexInPlaylist = this.pageSize;
    }
  }


  openRemoveActivityModal(
    sectionNameI18nId: string, subsectionName: string,
    activity: LearnerExplorationSummary | CollectionSummary): void {
  this.learnerDashboardActivityBackendApiService.removeActivityModalAsync(
    sectionNameI18nId, subsectionName,
    activity.id, activity.title)
    .then(() => {
      // if (sectionNameI18nId ===
      //   LearnerDashboardPageConstants
      //     .LEARNER_DASHBOARD_SECTION_I18N_IDS.INCOMPLETE) {
      //   if (subsectionName ===
      //     LearnerDashboardPageConstants
      //       .LEARNER_DASHBOARD_SUBSECTION_I18N_IDS.EXPLORATIONS) {
      //     let index = this.totalIncompleteLessonsList.findIndex(
      //       exp => exp.id === activity.id);
      //     if (index !== -1) {
      //       this.totalIncompleteLessonsList.splice(index, 1);
      //     }
      //   } else if (subsectionName ===
      //     LearnerDashboardPageConstants
      //       .LEARNER_DASHBOARD_SUBSECTION_I18N_IDS.COLLECTIONS) {
      //     let index = this.totalIncompleteLessonsList.findIndex(
      //       collection => collection.id === activity.id);
      //     if (index !== -1) {
      //       this.totalIncompleteLessonsList.splice(index, 1);
      //     }
      //   } if (this.showMoreInSection.incomplete === true) {
      //     this.displayIncompleteLessonsList = (
      //       this.totalIncompleteLessonsList);
      //   } else if (this.showMoreInSection.incomplete === false) {
      //     this.displayIncompleteLessonsList = (
      //       this.totalIncompleteLessonsList.slice(0, 3));
      //   } if (this.selectedSection === this.all) {
      //     this.displayInCommunityLessons = [];
      //     this.displayInCommunityLessons.push(
      //       ...this.totalIncompleteLessonsList,
      //       ...this.totalCompletedLessonsList);
      //   } if (this.displayInCommunityLessons.slice(
      //     this.startIndexInCommunityLessons,
      //     this.endIndexInCommunityLessons).length === 0) {
      //     this.pageNumberInCommunityLessons = 1;
      //     this.startIndexInCommunityLessons = 0;
      //     this.endIndexInCommunityLessons = 3;
      //   }
      // } 
      if (sectionNameI18nId ===
        LearnerDashboardPageConstants
          .LEARNER_DASHBOARD_SECTION_I18N_IDS.PLAYLIST) {
        if (subsectionName ===
          LearnerDashboardPageConstants
            .LEARNER_DASHBOARD_SUBSECTION_I18N_IDS.EXPLORATIONS) {
          let index = this.totalLessonsInPlaylist.findIndex(
            exp => exp.id === activity.id);
          if (index !== -1) {
            this.totalLessonsInPlaylist.splice(index, 1);
          }
        } else if (subsectionName ===
          LearnerDashboardPageConstants
            .LEARNER_DASHBOARD_SUBSECTION_I18N_IDS.COLLECTIONS) {
          let index = this.totalLessonsInPlaylist.findIndex(
            collection => collection.id === activity.id);
          if (index !== -1) {
            this.totalLessonsInPlaylist.splice(index, 1);
          }
        } if (this.showMoreInSection.playlist === true) {
          this.displayLessonsInPlaylist = this.totalLessonsInPlaylist;
        } else if (this.showMoreInSection.playlist === false) {
          this.displayLessonsInPlaylist = (
            this.totalLessonsInPlaylist.slice(0, 3));
        } if (this.windowIsNarrow) {
          this.displayLessonsInPlaylist = this.totalLessonsInPlaylist;
        } if (this.displayLessonsInPlaylist.slice(
          this.startIndexInPlaylist,
          this.endIndexInPlaylist).length === 0) {
          this.pageNumberInPlaylist = 1;
          this.startIndexInPlaylist = 0;
          this.endIndexInPlaylist = 3;
        }
      }
      // this.noCommunityLessonActivity = (
      //   (this.totalIncompleteLessonsList.length === 0) &&
      //   (this.totalCompletedLessonsList.length === 0));
      this.noPlaylistActivity = (
        (this.totalLessonsInPlaylist.length === 0));
    });
}
  
isLanguageRTL(): boolean {
  return this.i18nLanguageCodeService.isCurrentLanguageRTL();
}

  getTimeOfDay(): string {
    let time = new Date().getHours();

    if (time <= 12) {
      return 'I18N_LEARNER_DASHBOARD_MORNING_GREETING';
    } else if (time <= 18) {
      return 'I18N_LEARNER_DASHBOARD_AFTERNOON_GREETING';
    }
    return 'I18N_LEARNER_DASHBOARD_EVENING_GREETING';
  }

  isNonemptyObject(object: Object): boolean {
    return Object.keys(object).length !== 0;
  }

  getClassroomLink(classroomUrlFragment: string): string {
    this.classroomUrlFragment = classroomUrlFragment;
    return this.urlInterpolationService.interpolateUrl(
      this.CLASSROOM_LINK_URL_TEMPLATE, {
        classroom_url_fragment: this.classroomUrlFragment
      }
    );
  }

  isGoalLimitReached(): boolean {
    if (this.goalTopicsLength === 0) {
      return false;
    } else if (this.currentGoalsLength === this.goalTopicsLength) {
      return true;
    }
    return this.currentGoalsLength === AppConstants.MAX_CURRENT_GOALS_COUNT;
  }

  getWidth(length: number): number {
    /**
     * If there are 3 or more topics for each untrackedTopic, the total
     * width of the section will be 662px in mobile view to enable scrolling.
    */
    if (length >= 3) {
      return 662;
    }
    /**
     * If there less than 3 topics for each untrackedTopic, the total
     * width of the section will be calculated by multiplying the addition of
     * number of topics and one classroom card with 164px in mobile view to
     * enable scrolling.
    */
    return (length + 1) * 164;
  }

  changeActiveSection(): void {
    this.setActiveSection.emit(
      LearnerDashboardPageConstants.LEARNER_DASHBOARD_SECTION_I18N_IDS.GOALS);
  }
}
