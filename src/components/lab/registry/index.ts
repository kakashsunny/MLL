import { AlgorithmModule } from './types';
import { linearRegressionModule } from './algorithms/linearRegression';
import { logisticRegressionModule } from './algorithms/logisticRegression';
import { kmeansModule } from './algorithms/kmeansClustering';
import { svmModule } from './algorithms/svmAlgorithm';
import { decisionTreeModule } from './algorithms/decisionTree';
import { knnModule } from './algorithms/knnAlgorithm';
import { neuralNetworkModule } from './algorithms/neuralNetwork';
import { pcaModule } from './algorithms/pcaAlgorithm';
import { naiveBayesModule } from './algorithms/naiveBayes';
import { randomForestModule } from './algorithms/randomForest';

export * from './types';
export { linearRegressionModule } from './algorithms/linearRegression';
export { logisticRegressionModule } from './algorithms/logisticRegression';
export { kmeansModule } from './algorithms/kmeansClustering';
export { svmModule } from './algorithms/svmAlgorithm';
export { decisionTreeModule } from './algorithms/decisionTree';
export { knnModule } from './algorithms/knnAlgorithm';
export { neuralNetworkModule } from './algorithms/neuralNetwork';
export { pcaModule } from './algorithms/pcaAlgorithm';
export { naiveBayesModule } from './algorithms/naiveBayes';
export { randomForestModule } from './algorithms/randomForest';

class AlgorithmRegistry {
  private algorithms: Map<string, AlgorithmModule> = new Map();

  constructor() {
    // Register complete suite of interactive algorithms
    this.register(linearRegressionModule);
    this.register(logisticRegressionModule);
    this.register(kmeansModule);
    this.register(svmModule);
    this.register(decisionTreeModule);
    this.register(knnModule);
    this.register(neuralNetworkModule);
    this.register(pcaModule);
    this.register(naiveBayesModule);
    this.register(randomForestModule);
  }

  /**
   * Register a new or custom ML algorithm module into the workbench
   */
  public register(module: AlgorithmModule): void {
    this.algorithms.set(module.id, module);
  }

  /**
   * Retrieve an algorithm by its unique ID
   */
  public get(id: string): AlgorithmModule | undefined {
    return this.algorithms.get(id);
  }

  /**
   * List all currently registered algorithms
   */
  public getAll(): AlgorithmModule[] {
    return Array.from(this.algorithms.values());
  }

  /**
   * Return the primary default algorithm
   */
  public getDefault(): AlgorithmModule {
    return this.algorithms.get('linear_regression') || this.getAll()[0];
  }
}

// Export singleton instance of the registry
export const algorithmRegistry = new AlgorithmRegistry();
