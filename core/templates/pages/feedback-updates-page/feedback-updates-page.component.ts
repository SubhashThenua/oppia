// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Component for the Oppia 'feedback-Updates' page.
 */

import './feedback-updates-page.component.css';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { Component, OnInit, OnDestroy } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { AppConstants } from 'app.constants';
import { FeedbackThreadSummary, FeedbackThreadSummaryBackendDict } from 'domain/feedback_thread/feedback-thread-summary.model';
import { ProfileSummary } from 'domain/user/profile-summary.model';
import { FeedbackMessageSummary } from 'domain/feedback_message/feedback-message-summary.model';
import { LearnerDashboardBackendApiService } from 'domain/learner_dashboard/learner-dashboard-backend-api.service';
import { UrlInterpolationService } from 'domain/utilities/url-interpolation.service';
import { ThreadStatusDisplayService } from 'pages/exploration-editor-page/feedback-tab/services/thread-status-display.service';
import { LearnerDashboardPageConstants } from 'pages/learner-dashboard-page/learner-dashboard-page.constants';
import { AlertsService } from 'services/alerts.service';
import { DateTimeFormatService } from 'services/date-time-format.service';
import { LoaderService } from 'services/loader.service';
import { UserService } from 'services/user.service';
import { FocusManagerService } from 'services/stateful/focus-manager.service';
import { WindowDimensionsService } from 'services/contextual/window-dimensions.service';
import { I18nLanguageCodeService } from 'services/i18n-language-code.service';
import { PageTitleService } from 'services/page-title.service';
import { LearnerGroupBackendApiService } from 'domain/learner_group/learner-group-backend-api.service';
import { UrlService } from 'services/contextual/url.service';


@Component({
  selector: 'oppia-feedback-updates-page',
  templateUrl: './feedback-updates-page.component.html',
  styleUrls: ['./feedback-updates-page.component.css']
})
export class FeedbackUpdatesPageComponent{

}

angular.module('oppia').directive('oppiaFeedbackUpdatesPage',
  downgradeComponent({
    component: FeedbackUpdatesPageComponent
  }) as angular.IDirectiveFactory);