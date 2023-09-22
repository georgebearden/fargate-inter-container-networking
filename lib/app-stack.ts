import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecrAssets from 'aws-cdk-lib/aws-ecr-assets';
import * as logs from 'aws-cdk-lib/aws-logs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
    });

    const cluster = new ecs.Cluster(this, 'EcsCluster', { vpc });

    const container1 = new ecrAssets.DockerImageAsset(this, 'Container1', {
      directory: 'lib/container-1'
    });

    const container2 = new ecrAssets.DockerImageAsset(this, 'Container2', {
      directory: 'lib/container-2'
    });

    // container-1 has a server listening on port 3000
    // container-2 sends messages to conatiner-1 over the local loopback interface

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'MockTaskDefinition', {
      cpu: 512,
      memoryLimitMiB: 2048,
    });

    taskDefinition
      .addContainer('container-1', {
        image: ecs.ContainerImage.fromDockerImageAsset(container1),
        essential: true,
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: 'container1',
          logRetention: logs.RetentionDays.ONE_DAY,
        }),
      });

    taskDefinition
      .addContainer('container-2', {
        image: ecs.ContainerImage.fromDockerImageAsset(container2),
        essential: true,
        logging: ecs.LogDrivers.awsLogs({
          streamPrefix: 'container2',
          logRetention: logs.RetentionDays.ONE_DAY,
        }),
      });

    new ecs.FargateService(this, 'MockService', {
      cluster,
      taskDefinition
    });
  }
}
