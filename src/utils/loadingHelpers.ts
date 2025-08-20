// Loading state management utilities

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingConfig {
  message?: string;
  duration?: number;
  showProgress?: boolean;
  transparent?: boolean;
}

export const defaultLoadingConfig: LoadingConfig = {
  message: 'Loading...',
  duration: 2000,
  showProgress: true,
  transparent: true,
};

// Create a loading manager for common operations
export class LoadingManager {
  private static instance: LoadingManager;
  private loadingState: LoadingState = 'idle';
  private callbacks: ((state: LoadingState) => void)[] = [];

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  subscribe(callback: (state: LoadingState) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  setLoading(state: LoadingState) {
    this.loadingState = state;
    this.callbacks.forEach((callback) => callback(state));
  }

  getState(): LoadingState {
    return this.loadingState;
  }

  async withLoading<T>(operation: () => Promise<T>, config: LoadingConfig = {}): Promise<T> {
    try {
      this.setLoading('loading');
      const result = await operation();
      this.setLoading('success');

      // Auto-reset after success
      setTimeout(() => {
        if (this.loadingState === 'success') {
          this.setLoading('idle');
        }
      }, config.duration || 1000);

      return result;
    } catch (error) {
      this.setLoading('error');

      // Auto-reset after error
      setTimeout(() => {
        if (this.loadingState === 'error') {
          this.setLoading('idle');
        }
      }, config.duration || 2000);

      throw error;
    }
  }
}

// Common loading messages
export const LoadingMessages = {
  INITIALIZING: 'Initializing TallyKhata...',
  LOADING_PROFILE: 'Loading your profile...',
  SAVING_PROFILE: 'Saving profile...',
  LOADING_CUSTOMERS: 'Loading customers...',
  ADDING_CUSTOMER: 'Adding customer...',
  LOADING_TRANSACTIONS: 'Loading transactions...',
  SAVING_TRANSACTION: 'Saving transaction...',
  EXPORTING_DATA: 'Exporting your data...',
  DELETING_DATA: 'Clearing database...',
  GENERATING_REPORT: 'Generating report...',
  SYNCING: 'Syncing data...',
  BACKING_UP: 'Creating backup...',
  RESTORING: 'Restoring data...',
} as const;

// Helper functions for common loading patterns
export const createLoadingDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const simulateNetworkDelay = () => createLoadingDelay(Math.random() * 1000 + 500);

export const withMinimumDelay = async <T>(
  operation: () => Promise<T>,
  minDelay: number = 500
): Promise<T> => {
  const [result] = await Promise.all([operation(), createLoadingDelay(minDelay)]);
  return result;
};
