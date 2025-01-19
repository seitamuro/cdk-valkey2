import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CdkValkeyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, "SecurityGroup", {
      vpc,
      description: "Allow access to the cache cluster",
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(6379));

    const cluster = new elasticache.CfnReplicationGroup(
      this,
      "ReplicationGroup",
      {
        replicationGroupDescription: "test-cache",
        engine: "valkey",
        engineVersion: "7.2",
        cacheNodeType: "cache.t3.micro",
        cacheSubnetGroupName: new elasticache.CfnSubnetGroup(
          this,
          "SubnetGroup",
          {
            description: "test-subnet",
            subnetIds: vpc.selectSubnets({ subnetGroupName: "private" })
              .subnetIds,
          }
        ).ref,
        cacheParameterGroupName: new elasticache.CfnParameterGroup(
          this,
          "ParameterGroup",
          {
            cacheParameterGroupFamily: "valkey7",
            description: "test-parameter-group",
          }
        ).ref,
        numNodeGroups: 1,
        replicasPerNodeGroup: 1,
        securityGroupIds: [securityGroup.securityGroupId],
        atRestEncryptionEnabled: true,
        transitEncryptionEnabled: true,
      }
    );
  }
}
