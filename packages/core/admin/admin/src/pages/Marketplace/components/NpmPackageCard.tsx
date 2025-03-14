import {
  Box,
  Flex,
  Tooltip,
  Typography,
  Divider,
  Button,
  LinkButton,
  TypographyComponent,
} from '@strapi/design-system';
import { CheckCircle, ExternalLink, Download, Star, Check, Duplicate } from '@strapi/icons';
import { GitHub } from '@strapi/icons/symbols';
import pluralize from 'pluralize';
import { useIntl } from 'react-intl';
import * as semver from 'semver';
import { styled } from 'styled-components';

import BalerionLogo from '../../../assets/images/logo-balerion-2022.svg';
import { AppInfoContextValue } from '../../../features/AppInfo';
import { useNotification } from '../../../features/Notifications';
import { useTracking } from '../../../features/Tracking';
import { useClipboard } from '../../../hooks/useClipboard';

import type { Plugin, Provider } from '../hooks/useMarketplaceData';
import type { NpmPackageType } from '../MarketplacePage';

// Custom component to have an ellipsis after the 2nd line
const EllipsisText = styled<TypographyComponent<'p'>>(Typography)`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
`;

interface NpmPackageCardProps extends Pick<AppInfoContextValue, 'useYarn'> {
  npmPackage: Plugin | Provider;
  isInstalled: boolean;
  isInDevelopmentMode: AppInfoContextValue['autoReload'];
  npmPackageType: NpmPackageType;
  balerionAppVersion: AppInfoContextValue['balerionVersion'];
}

const NpmPackageCard = ({
  npmPackage,
  isInstalled,
  useYarn,
  isInDevelopmentMode,
  npmPackageType,
  balerionAppVersion,
}: NpmPackageCardProps) => {
  const { attributes } = npmPackage;
  const { formatMessage } = useIntl();
  const { trackUsage } = useTracking();

  const commandToCopy = useYarn
    ? `yarn add ${attributes.npmPackageName}`
    : `npm install ${attributes.npmPackageName}`;

  const madeByBalerionMessage = formatMessage({
    id: 'admin.pages.MarketPlacePage.plugin.tooltip.madeByBalerion',
    defaultMessage: 'Made by Balerion',
  });

  const npmPackageHref = `https://market.balerion.io/${pluralize.plural(npmPackageType)}/${
    attributes.slug
  }`;

  const versionRange = semver.validRange(attributes.balerionVersion);

  const isCompatible = versionRange
    ? semver.satisfies(balerionAppVersion ?? '', versionRange)
    : false;

  return (
    <Flex
      direction="column"
      justifyContent="space-between"
      paddingTop={4}
      paddingRight={4}
      paddingBottom={4}
      paddingLeft={4}
      hasRadius
      background="neutral0"
      shadow="tableShadow"
      height="100%"
      alignItems="normal"
      data-testid="npm-package-card"
    >
      <Box>
        <Flex direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box
            tag="img"
            src={attributes.logo.url}
            alt={`${attributes.name} logo`}
            hasRadius
            width={11}
            height={11}
          />
          <PackageStats
            githubStars={attributes.githubStars}
            npmDownloads={attributes.npmDownloads}
            npmPackageType={npmPackageType}
          />
        </Flex>
        <Box paddingTop={4}>
          <Typography tag="h3" variant="delta">
            <Flex
              alignItems="center"
              gap={attributes.validated && !attributes.madeByBalerion ? 2 : 1}
            >
              {attributes.name}
              {attributes.validated && !attributes.madeByBalerion && (
                <Tooltip
                  description={formatMessage({
                    id: 'admin.pages.MarketPlacePage.plugin.tooltip.verified',
                    defaultMessage: 'Plugin verified by Balerion',
                  })}
                >
                  <CheckCircle fill="success600" />
                </Tooltip>
              )}
              {attributes.madeByBalerion && (
                <Tooltip description={madeByBalerionMessage}>
                  <Box
                    tag="img"
                    src={BalerionLogo}
                    alt={madeByBalerionMessage}
                    width={6}
                    height="auto"
                  />
                </Tooltip>
              )}
            </Flex>
          </Typography>
        </Box>
        <Box paddingTop={2}>
          <EllipsisText tag="p" variant="omega" textColor="neutral600">
            {attributes.description}
          </EllipsisText>
        </Box>
      </Box>

      <Flex gap={2} style={{ alignSelf: 'flex-end' }} paddingTop={6}>
        <LinkButton
          size="S"
          href={npmPackageHref}
          isExternal
          endIcon={<ExternalLink />}
          aria-label={formatMessage(
            {
              id: 'admin.pages.MarketPlacePage.plugin.info.label',
              defaultMessage: 'Learn more about {pluginName}',
            },
            { pluginName: attributes.name }
          )}
          variant="tertiary"
          onClick={() => trackUsage('didPluginLearnMore')}
        >
          {formatMessage({
            id: 'admin.pages.MarketPlacePage.plugin.info.text',
            defaultMessage: 'More',
          })}
        </LinkButton>
        <InstallPluginButton
          isInstalled={isInstalled}
          isInDevelopmentMode={isInDevelopmentMode}
          isCompatible={isCompatible}
          commandToCopy={commandToCopy}
          balerionAppVersion={balerionAppVersion}
          balerionPeerDepVersion={attributes.balerionVersion}
          pluginName={attributes.name}
        />
      </Flex>
    </Flex>
  );
};

/* -------------------------------------------------------------------------------------------------
 * InstallPluginButton
 * -----------------------------------------------------------------------------------------------*/

interface InstallPluginButtonProps
  extends Pick<NpmPackageCardProps, 'isInstalled' | 'isInDevelopmentMode' | 'balerionAppVersion'> {
  commandToCopy: string;
  pluginName: string;
  balerionPeerDepVersion?: string;
  isCompatible?: boolean;
}

const InstallPluginButton = ({
  isInstalled,
  isInDevelopmentMode,
  isCompatible,
  commandToCopy,
  balerionAppVersion,
  balerionPeerDepVersion,
  pluginName,
}: InstallPluginButtonProps) => {
  const { toggleNotification } = useNotification();
  const { formatMessage } = useIntl();
  const { trackUsage } = useTracking();
  const { copy } = useClipboard();

  const handleCopy = async () => {
    const didCopy = await copy(commandToCopy);

    if (didCopy) {
      trackUsage('willInstallPlugin');
      toggleNotification({
        type: 'success',
        message: formatMessage({ id: 'admin.pages.MarketPlacePage.plugin.copy.success' }),
      });
    }
  };

  // Already installed
  if (isInstalled) {
    return (
      <Flex gap={2} paddingLeft={4}>
        <Check width="1.2rem" height="1.2rem" color="success600" />
        <Typography variant="omega" textColor="success600" fontWeight="bold">
          {formatMessage({
            id: 'admin.pages.MarketPlacePage.plugin.installed',
            defaultMessage: 'Installed',
          })}
        </Typography>
      </Flex>
    );
  }

  // In development, show install button
  if (isInDevelopmentMode && isCompatible !== false) {
    return (
      <CardButton
        balerionAppVersion={balerionAppVersion}
        balerionPeerDepVersion={balerionPeerDepVersion}
        handleCopy={handleCopy}
        pluginName={pluginName}
      />
    );
  }

  // Not in development and plugin not installed already. Show nothing
  return null;
};

/* -------------------------------------------------------------------------------------------------
 * CardButton
 * -----------------------------------------------------------------------------------------------*/

interface CardButtonProps
  extends Pick<NpmPackageCardProps, 'balerionAppVersion'>,
    Pick<InstallPluginButtonProps, 'balerionPeerDepVersion' | 'pluginName'> {
  handleCopy: () => void;
}

const CardButton = ({
  balerionPeerDepVersion,
  balerionAppVersion,
  handleCopy,
  pluginName,
}: CardButtonProps) => {
  const { formatMessage } = useIntl();
  const versionRange = semver.validRange(balerionPeerDepVersion);
  const isCompatible = semver.satisfies(balerionAppVersion ?? '', versionRange ?? '');

  const installMessage = formatMessage({
    id: 'admin.pages.MarketPlacePage.plugin.copy',
    defaultMessage: 'Copy install command',
  });

  // Only plugins receive a balerionAppVersion
  if (balerionAppVersion) {
    if (!versionRange || !isCompatible) {
      return (
        <Tooltip
          data-testid={`tooltip-${pluginName}`}
          label={formatMessage(
            {
              id: 'admin.pages.MarketPlacePage.plugin.version',
              defaultMessage:
                'Update your Balerion version: "{balerionAppVersion}" to: "{versionRange}"',
            },
            {
              balerionAppVersion,
              versionRange,
            }
          )}
        >
          <span>
            <Button
              size="S"
              startIcon={<Duplicate />}
              variant="secondary"
              onClick={handleCopy}
              disabled={!isCompatible}
            >
              {installMessage}
            </Button>
          </span>
        </Tooltip>
      );
    }
  }

  return (
    <Button size="S" startIcon={<Duplicate />} variant="secondary" onClick={handleCopy}>
      {installMessage}
    </Button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * PackageStats
 * -----------------------------------------------------------------------------------------------*/

interface PackageStatsProps {
  githubStars?: number;
  npmDownloads?: number;
  npmPackageType: NpmPackageType;
}

const PackageStats = ({ githubStars = 0, npmDownloads = 0, npmPackageType }: PackageStatsProps) => {
  const { formatMessage } = useIntl();

  return (
    <Flex gap={1}>
      {!!githubStars && (
        <>
          <GitHub height="1.2rem" width="1.2rem" aria-hidden />
          <Star height="1.2rem" width="1.2rem" fill="warning500" aria-hidden />
          <p
            aria-label={formatMessage(
              {
                id: `admin.pages.MarketPlacePage.${npmPackageType}.githubStars`,
                defaultMessage: `This {package} was starred {starsCount} on GitHub`,
              },
              {
                starsCount: githubStars,
                package: npmPackageType,
              }
            )}
          >
            <Typography variant="pi" textColor="neutral800">
              {githubStars}
            </Typography>
          </p>
          <VerticalDivider />
        </>
      )}
      <Download height="1.2rem" width="1.2rem" aria-hidden />
      <p
        aria-label={formatMessage(
          {
            id: `admin.pages.MarketPlacePage.${npmPackageType}.downloads`,
            defaultMessage: `This {package} has {downloadsCount} weekly downloads`,
          },
          {
            downloadsCount: npmDownloads,
            package: npmPackageType,
          }
        )}
      >
        <Typography variant="pi" textColor="neutral800">
          {npmDownloads}
        </Typography>
      </p>
    </Flex>
  );
};

const VerticalDivider = styled(Divider)`
  width: 1.2rem;
  transform: rotate(90deg);
`;

export { NpmPackageCard };
export type { NpmPackageCardProps };
