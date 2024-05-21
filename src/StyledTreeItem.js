import React from 'react';
import { TreeItem, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { useTheme, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import ErrorIcon from '@mui/icons-material/Error';
import AnimLoadingComponent from './AnimLoadingComponent';
import ReqRespIconButton from './ReqRespIconButton';
import { PENDING_STATE, SUCCESS_STATE, FAILURE_STATE } from './utils/constants';


const StyledDoneRoundedIcon = styled(DoneRoundedIcon)({
    backgroundColor: '#007800',
    color: '#ffffff',
    borderRadius: '50%'   
  });
  
  const StyledErrorIcon = styled(ErrorIcon)({
    color: '#aa0000'  
  });      

  
const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)',
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2),
    },
  },
}));

const StyledTreeItem = React.forwardRef(({
    bgColor,
    color,
    colorForDarkMode,
    bgColorForDarkMode,
    queryId,
    callId,
    state,
    url,
    duration,
    responseItemCount,
    httpStatus,
    ...other
  }, ref) => {
    const theme = useTheme();
  
    // Prepare style properties based on theme
    const styleProps = {
      '--tree-view-color': theme.palette.mode !== 'dark' ? color : colorForDarkMode,
      '--tree-view-bg-color': theme.palette.mode !== 'dark' ? bgColor : bgColorForDarkMode,
    };
  
    const getIconComponent = () => {
      switch (state) {
        case PENDING_STATE:
          return <AnimLoadingComponent />;
        case SUCCESS_STATE:
          return <StyledDoneRoundedIcon />;
        case FAILURE_STATE:
          return <StyledErrorIcon />;
        default:
          return null;
      }
    };
  
    return (
      <TreeItem
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
            {getIconComponent()}
            <Typography variant="body2" sx={{ ml: 1 }}>{httpStatus}</Typography>
            <Typography variant="body2" sx={{ flexGrow: 1, ml: 1 }}>
              <Link href={url} target="_blank" rel="noopener noreferrer">{url}</Link>
            </Typography>
            <ReqRespIconButton queryId={queryId} callId={callId} isRequest={true} />
            {state !== PENDING_STATE && <ReqRespIconButton queryId={queryId} callId={callId} isRequest={false} />}
            
            {duration && <Typography variant="body2" color="inherit" sx={{ fontWeight: 'inherit', flexGrow: 0.1 }}>
                  {duration}
            </Typography>
            }

            {responseItemCount && <Typography variant="body2" sx={{ ml: 1 }}>{responseItemCount}</Typography>}
          </Box>
        }
        style={styleProps}
        {...other}
        ref={ref}
      />
    );
  });
  

export default StyledTreeItem;