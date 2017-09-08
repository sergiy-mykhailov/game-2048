
import React from 'react';
import PropTypes from 'prop-types';

import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

class ModalDialog extends React.Component {

    render() {
        const style = {
            color: (this.props.isVictory) ? '#F65E3B' : '#541D1D',
            fontSize: '5vw',
            fontWeight: 800
        };

        const actions = [
            <FlatButton
                label="OK"
                primary={true}
                onClick={this.props.onClose}
            />
        ];

        return (
            <div>
                <Dialog
                    title={this.props.title}
                    actions={actions}
                    modal={true}
                    open={this.props.isOpen}
                    titleStyle={style}
                >
                </Dialog>
            </div>
        );
    }
}

ModalDialog.propTypes = {
    title:      PropTypes.string.isRequired,
    isOpen:     PropTypes.bool.isRequired,
    isVictory:  PropTypes.bool.isRequired,
    onClose:    PropTypes.func.isRequired,
};

export default ModalDialog;
