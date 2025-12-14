import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import AutoFitCanvas from '@/components/Canvas/AutoFitCanvas';
import { ReactComponent as RefreshIcon } from '@/assets/icons/refresh.svg';
import BaseView, {
  BaseViewHeading,
  BaseViewBody,
  BaseViewIcons,
  BaseViewIconButton,
} from './BaseView';

const CAMERA_SOURCES = {
  DASHBOARD: 'dashboard',
  LIMELIGHT: 'limelight',
};

class CameraView extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();

    this.renderImage = this.renderImage.bind(this);
    this.handleSourceChange = this.handleSourceChange.bind(this);

    this.image = new Image();
    this.image.onload = this.renderImage;

    this.state = {
      rotation: 0,
      cameraSource: CAMERA_SOURCES.DASHBOARD,
      limelightError: false,
    };
  }

  componentDidMount() {
    this.ctx = this.canvasRef.current.getContext('2d');
    
    // Check if Limelight is available
    this.checkLimelightAvailability();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.cameraSource === CAMERA_SOURCES.DASHBOARD) {
      this.image.src = `data:image/jpeg;base64,${this.props.imageStr}`;
    } else if (
      this.state.cameraSource === CAMERA_SOURCES.LIMELIGHT &&
      prevState.cameraSource !== CAMERA_SOURCES.LIMELIGHT
    ) {
      // When switching to Limelight, start loading the stream
      this.loadLimelightStream();
    }
  }

  componentWillUnmount() {
    // Clean up Limelight stream
    if (this.limelightStreamInterval) {
      clearInterval(this.limelightStreamInterval);
    }
  }

  async checkLimelightAvailability() {
    try {
      const response = await fetch('/dash/limelight/api/status', {
        method: 'GET',
        mode: 'cors',
      });
      if (response.ok) {
        this.setState({ limelightError: false });
      }
    } catch (error) {
      console.log('Limelight not available');
      this.setState({ limelightError: true });
    }
  }

  loadLimelightStream() {
    // Load the Limelight MJPEG stream
    this.image.src = '/dash/limelight/camera';
  }

  handleSourceChange(event) {
    const newSource = event.target.value;
    this.setState({ cameraSource: newSource });

    if (newSource === CAMERA_SOURCES.LIMELIGHT) {
      this.checkLimelightAvailability();
    }
  }

  renderImage() {
    if (this.ctx) {
      const hasImage =
        (this.state.cameraSource === CAMERA_SOURCES.DASHBOARD &&
          this.props.imageStr.length > 0) ||
        (this.state.cameraSource === CAMERA_SOURCES.LIMELIGHT &&
          this.image.complete &&
          this.image.naturalHeight !== 0);

      if (hasImage) {
        const canvas = this.canvasRef.current;

        // eslint-disable-next-line
        canvas.width = canvas.width; // clears the canvas

        const viewportWidth = canvas.width;
        const viewportHeight = canvas.height;

        // rotate the image
        const scale = Math.min(
          devicePixelRatio,
          (this.state.rotation % 2 === 0 ? viewportHeight : viewportWidth) /
            this.image.height,
          (this.state.rotation % 2 === 0 ? viewportWidth : viewportHeight) /
            this.image.width,
        );
        this.ctx.translate(viewportWidth / 2, viewportHeight / 2);
        this.ctx.rotate((this.state.rotation * Math.PI) / 2);
        this.ctx.scale(scale, scale);
        this.ctx.drawImage(
          this.image,
          -this.image.width / 2,
          -this.image.height / 2,
          this.image.width,
          this.image.height,
        );
      }
    }
  }

  render() {
    const { cameraSource, limelightError } = this.state;
    const showLimelightWarning =
      cameraSource === CAMERA_SOURCES.LIMELIGHT && limelightError;

    return (
      <BaseView isUnlocked={this.props.isUnlocked}>
        <div className="flex">
          <BaseViewHeading isDraggable={this.props.isDraggable}>
            Camera
          </BaseViewHeading>
          <div className="flex items-center gap-2 px-3">
            <select
              value={cameraSource}
              onChange={this.handleSourceChange}
              className="rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
              title="Camera Source"
            >
              <option value={CAMERA_SOURCES.DASHBOARD}>FTC Dashboard</option>
              <option value={CAMERA_SOURCES.LIMELIGHT}>Limelight 3A</option>
            </select>
          </div>
          <BaseViewIcons>
            <BaseViewIconButton title="Rotate">
              <RefreshIcon
                className="h-6 w-6"
                onClick={() =>
                  this.setState({ rotation: (this.state.rotation + 1) % 4 })
                }
              />
            </BaseViewIconButton>
          </BaseViewIcons>
        </div>
        <BaseViewBody>
          {showLimelightWarning && (
            <div className="mb-2 rounded bg-yellow-900 bg-opacity-50 px-3 py-2 text-sm text-yellow-200">
              Unable to connect to Limelight 3A. Make sure it's connected via
              WiFi Direct at 172.29.0.1.
            </div>
          )}
          <div style={{ height: '100%', minHeight: '10rem' }}>
            <AutoFitCanvas ref={this.canvasRef} onResize={this.renderImage} />
          </div>
        </BaseViewBody>
      </BaseView>
    );
  }
}

CameraView.propTypes = {
  imageStr: PropTypes.string.isRequired,

  isDraggable: PropTypes.bool,
  isUnlocked: PropTypes.bool,
};

const mapStateToProps = ({ camera }) => ({
  imageStr: camera.imageStr,
});

export default connect(mapStateToProps)(CameraView);
