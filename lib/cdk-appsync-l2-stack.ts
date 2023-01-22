import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as path from "path";

// DynamoDB Example
// https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_appsync-readme.html#dynamodb
export class CdkAppsyncL2Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // GraphQL API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'demo',
      schema: appsync.SchemaFile.fromAsset(path.join(__dirname, 'schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.IAM,
        },
      },
      xrayEnabled: true,
    });

    // DynamoDBテーブル
    const demoTable = new dynamodb.Table(this, 'DemoTable', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
    });

    // データソース
    const demoDS = api.addDynamoDbDataSource('demoDataSource', demoTable);

    // DynamoDbのテーブルをスキャンしてリスト全体を返すクエリ「getDemos」用のリゾルバ
    // Resolver Mapping Template Reference:
    // https://docs.aws.amazon.com/appsync/latest/devguide/resolver-mapping-template-reference-dynamodb.html
    demoDS.createResolver('QueryGetDemosResolver', {
      typeName: 'Query',
      fieldName: 'getDemos',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });

    // DynamoDbのテーブルに項目を入れるMutation "addDemo "のリゾルバ
    demoDS.createResolver('MutationAddDemoResolver', {
      typeName: 'Mutation',
      fieldName: 'addDemo',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbPutItem(
          appsync.PrimaryKey.partition('id').auto(),
          appsync.Values.projecting('input'),
      ),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem(),
    });

    // DynamoDB の読み取り一貫性を `MappingTemplate` で有効にする
    // demoDS.createResolver('QueryGetDemosConsistentResolver', {
    //   typeName: 'Query',
    //   fieldName: 'getDemosConsistent',
    //   requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(true),
    //   responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    // });
  }
}
