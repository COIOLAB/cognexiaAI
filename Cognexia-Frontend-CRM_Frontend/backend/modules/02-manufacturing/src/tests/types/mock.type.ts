// Generic Mock Type for TypeORM repositories and services
export type MockType<T = {}> = {
  [P in keyof T]?: jest.Mock<any, any>;
};
