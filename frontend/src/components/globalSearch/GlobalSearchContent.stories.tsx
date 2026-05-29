/*
 * Copyright 2025 The Kubernetes Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Box from '@mui/material/Box';
import type { Meta, StoryObj } from '@storybook/react';
import ConfigMap from '../../lib/k8s/configMap';
import CronJob from '../../lib/k8s/cronJob';
import Deployment from '../../lib/k8s/deployment';
import Endpoints from '../../lib/k8s/endpoints';
import EndpointSlice from '../../lib/k8s/endpointSlices';
import Ingress from '../../lib/k8s/ingress';
import Job from '../../lib/k8s/job';
import JobSet from '../../lib/k8s/jobSet';
import type { KubeObjectClass } from '../../lib/k8s/KubeObject';
import Namespace from '../../lib/k8s/namespace';
import Node from '../../lib/k8s/node';
import PersistentVolumeClaim from '../../lib/k8s/persistentVolumeClaim';
import Pod from '../../lib/k8s/pod';
import ReplicaSet from '../../lib/k8s/replicaSet';
import Service from '../../lib/k8s/service';
import ServiceAccount from '../../lib/k8s/serviceAccount';
import StatefulSet from '../../lib/k8s/statefulSet';
import { TestContext } from '../../test';
import { GlobalSearchContent } from './GlobalSearchContent';

type SearchState = 'empty' | 'loading' | 'withResults' | 'noResults' | 'error';

interface StoryArgs {
  defaultValue: string;
  maxWidth: number;
  onBlur: () => void;
  searchState: SearchState;
}

const searchableClasses: KubeObjectClass[] = [
  Pod,
  Deployment,
  Service,
  Job,
  CronJob,
  ConfigMap,
  Namespace,
  StatefulSet,
  ReplicaSet,
  PersistentVolumeClaim,
  Endpoints,
  EndpointSlice,
  Ingress,
  ServiceAccount,
  Node,
  JobSet,
];

const podResults = [
  new Pod(
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: 'nginx-frontend',
        namespace: 'default',
        uid: 'storybook-pod-nginx-frontend',
        labels: {
          app: 'nginx',
          tier: 'frontend',
        },
        creationTimestamp: '2025-01-01T00:00:00Z',
      },
      spec: {
        containers: [],
        nodeName: 'kind-control-plane',
      },
      status: {
        conditions: [],
        containerStatuses: [],
        phase: 'Running',
        startTime: '2025-01-01T00:00:00Z',
      },
    },
    'storybook'
  ),
  new Pod(
    {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: {
        name: 'nginx-worker',
        namespace: 'default',
        uid: 'storybook-pod-nginx-worker',
        labels: {
          app: 'nginx',
          tier: 'worker',
        },
        creationTimestamp: '2025-01-01T00:00:00Z',
      },
      spec: {
        containers: [],
        nodeName: 'kind-control-plane',
      },
      status: {
        conditions: [],
        containerStatuses: [],
        phase: 'Running',
        startTime: '2025-01-01T00:00:00Z',
      },
    },
    'storybook'
  ),
];

function installSearchResourceMocks(searchState: SearchState) {
  const error = searchState === 'error' ? new Error('Failed to load search resources') : null;

  searchableClasses.forEach(cls => {
    const items = searchState === 'withResults' && cls.kind === Pod.kind ? podResults : [];

    cls.useList = (() => ({
      items,
      errors: error ? [error] : null,
      error,
      clusterResults: {},
      isError: !!error,
      isLoading: searchState === 'loading',
      isFetching: searchState === 'loading',
      isSuccess: !error,
    })) as any;
  });
}

const meta: Meta<StoryArgs> = {
  title: 'GlobalSearch/GlobalSearchContent',
  component: GlobalSearchContent,
  argTypes: {
    searchState: {
      control: 'select',
      options: ['empty', 'loading', 'withResults', 'noResults', 'error'],
    },
  },
  args: {
    maxWidth: 560,
    onBlur: () => {},
  },
  render: args => {
    installSearchResourceMocks(args.searchState);
    localStorage.removeItem('search-recent-items');

    return (
      <TestContext>
        <Box sx={{ width: args.maxWidth }}>
          <GlobalSearchContent
            key={`${args.searchState}-${args.defaultValue}`}
            maxWidth={args.maxWidth}
            defaultValue={args.defaultValue}
            onBlur={args.onBlur}
          />
        </Box>
      </TestContext>
    );
  },
};

export default meta;

type Story = StoryObj<StoryArgs>;

export const EmptyInput: Story = {
  args: {
    defaultValue: '',
    searchState: 'empty',
  },
};

export const Loading: Story = {
  args: {
    defaultValue: 'nginx',
    searchState: 'loading',
  },
};

export const WithResults: Story = {
  args: {
    defaultValue: 'nginx',
    searchState: 'withResults',
  },
};

export const NoResults: Story = {
  args: {
    defaultValue: 'does-not-exist',
    searchState: 'noResults',
  },
};

export const WithError: Story = {
  args: {
    defaultValue: 'nginx',
    searchState: 'error',
  },
};
