import { DatasetItem } from '../types';

export const BUILTIN_DATASETS: DatasetItem[] = [
  {
    id: 'dataset_california_housing',
    name: 'California Housing (20,640 rows)',
    category: 'Regression',
    description: 'Median house values for California districts derived from the 1990 census. Standard benchmark for spatial continuous prediction.',
    rows: 20640,
    columns: ['MedInc', 'HouseAge', 'AveRooms', 'AveBedrms', 'Population', 'AveOccup', 'Latitude', 'Longitude', 'MedHouseVal'],
    targetColumn: 'MedHouseVal',
    dataTypes: {
      MedInc: 'float64',
      HouseAge: 'float64',
      AveRooms: 'float64',
      AveBedrms: 'float64',
      Population: 'float64',
      AveOccup: 'float64',
      Latitude: 'float64',
      Longitude: 'float64',
      MedHouseVal: 'float64 (target)'
    },
    missingValues: {
      MedInc: 0,
      HouseAge: 0,
      AveRooms: 0,
      AveBedrms: 0,
      Population: 0,
      AveOccup: 0,
      Latitude: 0,
      Longitude: 0,
      MedHouseVal: 0
    },
    correlations: [
      { featA: 'MedInc', featB: 'MedHouseVal', value: 0.688 },
      { featA: 'AveRooms', featB: 'MedHouseVal', value: 0.152 },
      { featA: 'HouseAge', featB: 'MedHouseVal', value: 0.106 },
      { featA: 'Latitude', featB: 'Longitude', value: -0.925 },
      { featA: 'AveOccup', featB: 'MedHouseVal', value: -0.024 }
    ],
    previewData: [
      { MedInc: 8.3252, HouseAge: 41.0, AveRooms: 6.98, AveBedrms: 1.02, Population: 322.0, AveOccup: 2.55, Latitude: 37.88, Longitude: -122.23, MedHouseVal: 4.526 },
      { MedInc: 8.3014, HouseAge: 21.0, AveRooms: 6.23, AveBedrms: 0.97, Population: 2401.0, AveOccup: 2.11, Latitude: 37.86, Longitude: -122.22, MedHouseVal: 3.585 },
      { MedInc: 7.2574, HouseAge: 52.0, AveRooms: 8.28, AveBedrms: 1.07, Population: 496.0, AveOccup: 2.80, Latitude: 37.85, Longitude: -122.24, MedHouseVal: 3.521 },
      { MedInc: 5.6431, HouseAge: 52.0, AveRooms: 5.81, AveBedrms: 1.07, Population: 558.0, AveOccup: 2.54, Latitude: 37.85, Longitude: -122.25, MedHouseVal: 3.413 },
      { MedInc: 3.8462, HouseAge: 52.0, AveRooms: 6.28, AveBedrms: 1.08, Population: 565.0, AveOccup: 2.18, Latitude: 37.85, Longitude: -122.25, MedHouseVal: 3.422 },
      { MedInc: 4.0368, HouseAge: 52.0, AveRooms: 4.76, AveBedrms: 1.10, Population: 413.0, AveOccup: 2.13, Latitude: 37.85, Longitude: -122.25, MedHouseVal: 2.697 }
    ]
  },
  {
    id: 'dataset_titanic',
    name: 'Titanic Disaster (891 rows)',
    category: 'Classification',
    description: 'Demographic and ticket records of passengers with passenger survival status. Great for missing value imputation and categorical encoding.',
    rows: 891,
    columns: ['PassengerId', 'Survived', 'Pclass', 'Name', 'Sex', 'Age', 'SibSp', 'Parch', 'Fare', 'Embarked'],
    targetColumn: 'Survived',
    dataTypes: {
      PassengerId: 'int64',
      Survived: 'int64 (target: 0/1)',
      Pclass: 'int64 (1st/2nd/3rd)',
      Name: 'string',
      Sex: 'categorical',
      Age: 'float64',
      SibSp: 'int64',
      Parch: 'int64',
      Fare: 'float64',
      Embarked: 'categorical'
    },
    missingValues: {
      PassengerId: 0,
      Survived: 0,
      Pclass: 0,
      Name: 0,
      Sex: 0,
      Age: 177, // 19.8% missing
      SibSp: 0,
      Parch: 0,
      Fare: 0,
      Embarked: 2
    },
    correlations: [
      { featA: 'Pclass', featB: 'Survived', value: -0.338 },
      { featA: 'Fare', featB: 'Survived', value: 0.257 },
      { featA: 'Age', featB: 'Survived', value: -0.077 },
      { featA: 'Parch', featB: 'Survived', value: 0.081 }
    ],
    previewData: [
      { PassengerId: 1, Survived: 0, Pclass: 3, Name: 'Braund, Mr. Owen Harris', Sex: 'male', Age: 22.0, SibSp: 1, Parch: 0, Fare: 7.25, Embarked: 'S' },
      { PassengerId: 2, Survived: 1, Pclass: 1, Name: 'Cumings, Mrs. John Bradley', Sex: 'female', Age: 38.0, SibSp: 1, Parch: 0, Fare: 71.28, Embarked: 'C' },
      { PassengerId: 3, Survived: 1, Pclass: 3, Name: 'Heikkinen, Miss. Laina', Sex: 'female', Age: 26.0, SibSp: 0, Parch: 0, Fare: 7.92, Embarked: 'S' },
      { PassengerId: 4, Survived: 1, Pclass: 1, Name: 'Futrelle, Mrs. Jacques Heath', Sex: 'female', Age: 35.0, SibSp: 1, Parch: 0, Fare: 53.10, Embarked: 'S' },
      { PassengerId: 5, Survived: 0, Pclass: 3, Name: 'Allen, Mr. William Henry', Sex: 'male', Age: 35.0, SibSp: 0, Parch: 0, Fare: 8.05, Embarked: 'S' }
    ]
  },
  {
    id: 'dataset_iris',
    name: 'Iris Flower (150 rows)',
    category: 'Multiclass Classification',
    description: 'Fisher 1936 classic dataset measuring sepal and petal dimensions across 3 plant species (Setosa, Versicolor, Virginica).',
    rows: 150,
    columns: ['sepal_length', 'sepal_width', 'petal_length', 'petal_width', 'species'],
    targetColumn: 'species',
    dataTypes: {
      sepal_length: 'float64',
      sepal_width: 'float64',
      petal_length: 'float64',
      petal_width: 'float64',
      species: 'categorical'
    },
    missingValues: {
      sepal_length: 0,
      sepal_width: 0,
      petal_length: 0,
      petal_width: 0,
      species: 0
    },
    correlations: [
      { featA: 'petal_length', featB: 'petal_width', value: 0.963 },
      { featA: 'sepal_length', featB: 'petal_length', value: 0.872 },
      { featA: 'sepal_length', featB: 'petal_width', value: 0.818 },
      { featA: 'sepal_length', featB: 'sepal_width', value: -0.118 }
    ],
    previewData: [
      { sepal_length: 5.1, sepal_width: 3.5, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
      { sepal_length: 4.9, sepal_width: 3.0, petal_length: 1.4, petal_width: 0.2, species: 'setosa' },
      { sepal_length: 7.0, sepal_width: 3.2, petal_length: 4.7, petal_width: 1.4, species: 'versicolor' },
      { sepal_length: 6.4, sepal_width: 3.2, petal_length: 4.5, petal_width: 1.5, species: 'versicolor' },
      { sepal_length: 6.3, sepal_width: 3.3, petal_length: 6.0, petal_width: 2.5, species: 'virginica' }
    ]
  }
];
