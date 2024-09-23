import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import BaseView, { BaseViewHeading } from '@/components/views/BaseView';
import Field from './Field';
import AutoFitCanvas from '@/components/Canvas/AutoFitCanvas';

class FieldView extends React.Component {
  constructor(props) {
    super(props);

    this.canvasRef = React.createRef();

    this.renderField = this.renderField.bind(this);
    this.handleSaveToFile = this.handleSaveToFile.bind(this);
    this.handleClearData = this.handleClearData.bind(this);

    this.overlay = { ops: [] };
  }

  componentDidMount() {
    this.field = new Field(this.canvasRef.current);
    this.renderField();
  }

  componentDidUpdate(prevProps) {
    if (this.props.telemetry === prevProps.telemetry) return;

    this.overlay = this.props.telemetry.reduce(
      (acc, { field, fieldOverlay }) =>
        fieldOverlay.ops.length === 0
          ? acc
          : {
              ops: [...field.ops, ...fieldOverlay.ops],
            },
      this.overlay,
    );

    this.field.setOverlay(this.overlay);
    this.renderField();
  }

  renderField() {
    if (this.field) {
      this.field.render();
    }
  }

  handleSaveToFile() {
    if (this.field && this.field.getData()) {
      this.field.saveToFile('this gets overwritten why does this param even exist');
      console.log('Field data saved to file.');
    } else {
      console.error('No data available to save.');
    }
  }
  handleClearData() {
      if (this.field) {
        this.field.clearData();
      }
    }

  handleFileChange = (event) => {
    const files = event.target.files; // This will be a FileList
    this.field.addReplay(files);
  };

  render() {
      return (
        <BaseView isUnlocked={this.props.isUnlocked}>
          <BaseViewHeading isDraggable={this.props.isDraggable}>
            Field
          </BaseViewHeading>

          {/* Auto-fitting canvas */}
          <AutoFitCanvas
            ref={this.canvasRef}
            onResize={this.renderField}
            containerHeight="calc(200% - 3em)"
          />

          {/* File Selector */}
          <div className="file-selector-container" style={{ textAlign: 'center', marginBottom: '0.5em' }}>
            <input
              type="file"
              onChange={this.handleFileChange}
              style={{
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '5px',
              }}
            multiple
            />
          </div>

          {/* Button Container */}
          <div className="button-container" style={{ textAlign: 'center' }}>
            {/* Save Button */}
            <button
              onClick={this.handleSaveToFile}
              style={{
                padding: '8px 20px',
                backgroundColor: '#FFD700', // Bright yellow for visibility
                border: '1px solid #FFA500',
                borderRadius: '5px',
                cursor: 'pointer',
                color: '#000',
                marginRight: '1em', // Add space between buttons
              }}
            >
              Save to File
            </button>

            {/* Clear Data Button */}
            <button
              onClick={this.handleClearData}
              style={{
                padding: '8px 20px',
                backgroundColor: '#FFD700',
                border: '1px solid #FFA500',
                borderRadius: '5px',
                cursor: 'pointer',
                color: '#000',
              }}
            >
              Clear Data
            </button>
          </div>
        </BaseView>
      );
    }
  }

FieldView.propTypes = {
  telemetry: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDraggable: PropTypes.bool,
  isUnlocked: PropTypes.bool,
};

const mapStateToProps = ({ telemetry }) => ({
  telemetry,
});

export default connect(mapStateToProps)(FieldView);
