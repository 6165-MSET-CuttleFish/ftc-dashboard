package com.acmerobotics.dashboard.message.redux;

import com.acmerobotics.dashboard.message.Message;
import com.acmerobotics.dashboard.message.MessageType;

public class ReceiveKeyboardState extends Message {
    public static class KeyboardState {
        public boolean w, a, s, d;
        public boolean space, shift, ctrl;
        public boolean up, down, left, right;
        public boolean q, e, r, f;

        public void clear() {
            w = a = s = d = false;
            space = shift = ctrl = false;
            up = down = left = right = false;
            q = e = r = f = false;
        }
    }

    private KeyboardState keyboardState;

    public ReceiveKeyboardState() {
        super(MessageType.RECEIVE_KEYBOARD_STATE);
    }

    public ReceiveKeyboardState(KeyboardState keyboardState) {
        super(MessageType.RECEIVE_KEYBOARD_STATE);
        this.keyboardState = keyboardState;
    }

    public KeyboardState getKeyboardState() {
        return keyboardState;
    }

    public void setKeyboardState(KeyboardState keyboardState) {
        this.keyboardState = keyboardState;
    }
}