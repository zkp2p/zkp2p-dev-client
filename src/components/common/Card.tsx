import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';

import { SVGIconThemed } from '@components/SVGIcon/SVGIconThemed';
import {
  colors,
  radii,
  fontFamilies,
  fontWeights,
  letterSpacing,
  lineHeights,
  fontSizes,
} from '@theme/colors';
const StyledCard = styled.div<{ cursor: string }>`
	display: flex;
	background-color: ${colors.backgroundSecondary};
	background-size: auto 100%;
	background-position: right;
	background-repeat: no-repeat;
	background-origin: border-box;

	flex-direction: column;
	justify-content: space-between;
	text-decoration: none;
	color: ${({ theme }) => theme.neutral1};
	padding: 32px;
	height: 228px;
	border-radius: ${radii.xl}px;
	border: 1px solid ${colors.defaultBorderColor};
  cursor: ${({ cursor }) => cursor}};
  text-align: left;
  width: 100%;

  &:focus-visible {
    outline: 1px solid ${colors.selectorHoverBorder};
    outline-offset: 2px;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const CardTitle = styled.div`
  font-size: 28px;
  line-height: ${lineHeights.headline};
  font-weight: ${fontWeights.semibold};
  font-family: ${fontFamilies.headline};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.headline};
  color: ${colors.darkText};
`

const CardDescription = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 20px;
  line-height: 28px;
  color: white;
  padding: 0 40px 0 0;
  max-width: 480px;
`

const CardCTA = styled.div`
  color: ${colors.darkText};
  font-weight: ${fontWeights.semibold};
  font-size: ${fontSizes.button}px;
  line-height: ${lineHeights.single};
  font-family: ${fontFamilies.body};
  text-transform: uppercase;
  letter-spacing: ${letterSpacing.wide};
  margin: 24px 0px 0px;
  transition: opacity 250ms ease 0s;
  &:hover {
    opacity: 0.6;
  }
`

const Icon = styled(SVGIconThemed)`
  width: 20px;
  height: 20px;
`;

const Card = ({
  title,
  description,
  icon,
  cta,
  navigateTo,
}: {
  title: string
  description: string
  icon?: string
  cta?: string
  navigateTo?: string
}) => {
  const location = useLocation();
  const isExternal = !!navigateTo && navigateTo.startsWith('http');
  const isLink = !!navigateTo;
  const cardProps = !isLink
    ? {}
    : isExternal
      ? { as: 'a', href: navigateTo, target: '_blank', rel: 'noopener noreferrer' }
      : { as: Link, to: navigateTo + location.search };

  return (
		<StyledCard
      cursor={navigateTo ? 'pointer' : 'normal'}
      {...cardProps}
    >
			<TitleRow>
				<CardTitle>{title}</CardTitle>
				{icon ? <Icon icon={icon} /> : null}
			</TitleRow>
			<CardDescription>
				{description}
			</CardDescription>
      <CardCTA>
        {cta || ''}
      </CardCTA>
		</StyledCard>
  )
}

export default Card
